import * as React from 'react';
import styles from './Listview.module.scss';
import { IListviewProps } from './IListviewProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ListView, IViewField, SelectionMode} from "@pnp/spfx-controls-react/lib/ListView";
import { DateTimePicker, DateConvention } from '@pnp/spfx-controls-react/lib/dateTimePicker';
import { PrimaryButton } from 'office-ui-fabric-react';
import { SPHttpClient } from '@microsoft/sp-http';
export interface IListviewState {
  items: any[];
  fromDate?: Date | null;
  toDate?: Date | null;
  fromDateStr: string;
  toDateStr: string;
}

export default class Listview extends React.Component<IListviewProps, IListviewState> {

  constructor(props: IListviewProps, state: IListviewState) {
    super(props);
    let cdate = new Date();
    let dd= ((cdate.getMonth() + 1) + '-'+cdate.getDate()+ '-'+ cdate.getFullYear());
    this.state = {
      items: [],
      fromDate: new Date(),
      toDate: new Date(),
      fromDateStr: dd,
      toDateStr: dd,
    };
  }
  public componentDidMount() {
    console.log(this.state.fromDate);
    //const restApi = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Requests')/items?$filter=(RequestDate%20ge%20datetime%272020-01-04T00:00:00%27 and RequestDate%20le%20datetime%272020-01-04T00:00:00%27)`;    
    this._loadList(); 
  }
  public componentDidUpdate(prevProps: IListviewProps, prevState: IListviewState, prevContext: any): void {
    if ((this.state.fromDateStr !== prevState.fromDateStr) || (this.state.toDateStr !== prevState.toDateStr)) {
      //this._loadList();      
    }
  }
  public render(): React.ReactElement<IListviewProps> {
    const viewFields: IViewField[] = [
      {
        name: 'Title',
        displayName: 'Title',
        sorting: true,
        maxWidth: 80
      },
    
      {
        name: 'Request_Date',
        displayName: "Request_Date",
        sorting: true,
        maxWidth: 80
      }
    ];
    return (
     
      <div className={styles.listview}>
      <div className={styles.container}>
        <br></br>
        <div className={styles.row2}>
          <div className={styles.column2}>
          <label style={{padding: "30px", verticalAlign: "middle"}}>Start Date : </label>
          </div>
          <div className={styles.column2}>
          <DateTimePicker
            dateConvention={DateConvention.Date} 
            isMonthPickerVisible={false} 
            showGoToToday={false} 
            formatDate={this._onFormatDate} 
            onChange={this._onSelectStartDate}   
            value={this.state.fromDate}    
            showLabels={false}           
            />
          </div>
          <div className={styles.column2}>
          <label style={{padding: "30px", verticalAlign: "middle"}}>End Date : </label>
          </div>
          <div className={styles.column2}>
          <DateTimePicker  
            dateConvention={DateConvention.Date} 
            isMonthPickerVisible={false} 
            showGoToToday={false} 
            formatDate={this._onFormatDate} 
            onChange={this._onSelectEndDate}  
            value={this.state.toDate}   
            showLabels={false}             
            />                  
          </div>
          <div className={styles.column2}>    
          <PrimaryButton text="Filter" onClick={this._filterClicked} disabled={false} checked={false} />
          </div>
        </div>
        <div>
          <br></br>
          <h2>Reusable Listview</h2>
          <ListView
          items={this.state.items}
          viewFields={viewFields}
          iconFieldName="ServerRelativeUrl"
          compact={false}
          selectionMode={SelectionMode.multiple}
          selection={this._getSelection}
          showFilter={true}
          filterPlaceHolder="Search..." />
        </div>            
      </div>
      </div>
    );
  }
  private _getSelection(items: any[]) {
    console.log('Selected items:', items);
  }
  private _onFormatDate = (date: Date): string => {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getFullYear());
  }
  //Called on Start Date change and to set State
  private _onSelectStartDate = (date1: Date | null | undefined): void => {
    //console.log("Date selected"+ (date.getFullYear()) +'-'+(date.getMonth() + 1) + '-' + date.getDate()+'T00:00:00'); 
    var strFromDate: string;
    strFromDate= (date1.getFullYear()) +'-'+(date1.getMonth() + 1) + '-' + date1.getDate();
    this.setState({ fromDate:date1, fromDateStr: strFromDate}, () => console.log(this.state.fromDate + "  "+this.state.fromDateStr));
  }
  //Called on End Date change and to set State
  private _onSelectEndDate = (date2: Date | null | undefined): void => {
    var strToDate: string;
    strToDate= (date2.getFullYear()) +'-'+(date2.getMonth() + 1) + '-' + date2.getDate();
    this.setState({ toDate:date2, toDateStr: strToDate}, () => console.log(this.state.toDate + "  "+this.state.toDateStr));
  }
  //Called when filter button is clicked
  public _filterClicked = ()=> {
    this._loadList();
  }
  //To retrieve SP List data
  private _loadList():void {
    const restApi = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Requests')/items?$filter=Request_Date ge '${this.state.fromDateStr}' and Request_Date le '${this.state.toDateStr}'`;
    this.props.context.spHttpClient.get(restApi, SPHttpClient.configurations.v1)
      .then(resp => { return resp.json(); })
      .then(items => {
        this.setState({
          items: items.value ? items.value : []
        });
      });
  }
}
