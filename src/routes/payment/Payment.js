import React from 'react';
import { getUserFromSession } from '../../core/appUtils';
import {dataMap} from '../../config';
import _ from 'lodash';
import history from '../../core/history';
import {RaisedButton, TextField} from 'material-ui';


class Payment extends React.Component{
    constructor(props){
            super(props);
            this.state = {project:{}, formError:[], openSubmitPopup:false, positionsNeeded: {}, paymentForm: {}};
            this.handleChange = this.handleChange.bind(this);
            this.submitPaymentInfo = this.submitPaymentInfo.bind(this);
        }
    componentDidMount(){
        var _this = this;
        this.setState({currentUser: getUserFromSession()});
        if(this.props.context && this.props.context.params.projectId){
             fetch(`/deals/${this.props.context.params.projectId}`) .then((res) => {return res.json();}).then(projectRes =>{
                _this.setState({project: projectRes, positionsNeeded: JSON.parse(projectRes[dataMap.PROJECT_FIELD_MAP.positionsNeeded])});
             });

        }
    }
    handleChange(event, checked) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
         var newForm = _.extend({}, this.state.paymentForm);
        newForm[name] = value;
        this.setState({ paymentForm: newForm });
    }
    submitPaymentInfo(){
        Stripe.card.createToken({
          number: this.state.paymentForm.creditCardNum,
          cvc: this.state.paymentForm.cvc,
          exp_month: this.state.paymentForm.expireMonth,
          exp_year: this.state.paymentForm.expireYear,
        }, (status, response)=>{
            if(!response.error){
                fetch(`/users/${this.state.currentUser.id}/paymentInfo`, {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      token: response.id
                    })
                })
                .then((res) => {
                    return res.json();
                })
                .then((response)=>{
                    //Successfully saved user payment info
                }).catch(function(error){
                    this.setState({formError:error});
                });
            }else {
                this.setState({formError: response.error.message})
            }
        });

    }
    render(){
        var breakDown = [];
        if(this.state.positionsNeeded.items){
            breakDown = this.state.positionsNeeded.items.map((position, index)=>{return <li key={index}><b>{position.position} </b><span class="pull-right"> ${position.budget}</span></li>}, this);
        }

        return (
         <div container>
            <h2>Enter payment info for {this.state.project.title}</h2>
            <ul>{breakDown}</ul>
            <br/>
            <p>You will not be charged until all crew members accepted the project invitation. Each of the crew members will receive half of their total amount. After the project is done, they will receive another half of the payment.</p>
            <div>
                <div>
                    <Col sm={6}>
                        <TextField type="text" name="creditCardNum" value={this.state.paymentForm.creditCardNum} placeholder="Credit card number" onChange={this.handleChange}/>
                    </Col>
                </div>
                <div >
                    <label>Expiration</label>
                    <Col sm={1}>
                        <TextField className="form-control" type="number" name="expireMonth" value={this.state.paymentForm.expireMonth} placeholder="MM" onChange={this.handleChange}/>
                    </Col>
                    <Col sm={1}>
                        <TextField className="form-control" type="number" name="expireYear" value={this.state.paymentForm.expireYear} placeholder="YYYY" onChange={this.handleChange}/>
                    </Col>
                </div>
                <div>
                    <Col sm={1}>
                        <TextField type="text" name="cvc" value={this.state.paymentForm.cvc} placeholder="CVC" onChange={this.handleChange}/>
                    </Col>

                </div>
            </div>
            <br/>
            <br/>
            <RaisedButton onClick={this.submitPaymentInfo}>Save Payment Info</RaisedButton>
         </div>
        )
    }
}
export default Payment;