import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { InAppBrowserObject, InAppBrowserOptions, InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  paymentBrowser: InAppBrowserObject;
  target = '_blank';
  iabOptions: InAppBrowserOptions = {
    location: "no",
    toolbar: "yes",
    hidden: "yes"
  };

  constructor(public navCtrl: NavController,
    public httpClient: HttpClient,
    public inAppBrowser: InAppBrowser) {}

    //this funcation to generate payment link
  generatePayment(){
    this.getPaymentLink().subscribe(data => {
      //success response back with result that contains the payment link 
      //so we will open it on InAppBrowser Plugin now

      if (data.result) {
        this.openPaymentBrwserWithURL(data.result);
      }
    }, err => {});
  }

  // this function using for post requests
  getPaymentLink(): Observable<any>{
    //url of maktapp credits
    let url = "";

    //headers that required for the request
    let headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    //post parameters that required for the request
    let postParameters = {
      "token": "", //put here your account token
      "currencyCode": "",//put here your currency code
      "orderId": "", //put here your order id
      "Note": "", //put here your notes
      "customeremail": "",//put here your customer email
      "customerName": "",//put here your customer name
      "customerPhone": "",//put here your customer phone
      "isrecurring": "",//if your payment is recurring so you need to put (1) else (0)
      "customerCountry": "",//put here your customer country
      "Lang": "",//put here your language (en or ar)
      "Amount": "",// put here your amount
      "from": 0// put here from attributes value
    };

    return this.httpClient.post(url, postParameters, { headers: new HttpHeaders(headersConfig) }).map(response => {
      return response;
    }).catch((err: any) => {
      return Observable.throw(err);
    });
  }

  openPaymentBrwserWithURL(URL) {
    //here we prepare browser
    this.paymentBrowser = this.inAppBrowser.create(encodeURI(URL), this.target, this.iabOptions);

    //here we listen if load is stop that mean the page is successfully loaded so we will display
    //the broswer for the users
    this.paymentBrowser.on('loadstop').subscribe((ev) => {
      this.paymentBrowser.show();
    });

    //here we listen if loading url make error or something so we can close the browser
    this.paymentBrowser.on('loaderror').subscribe((error) => {
      this.paymentBrowser.close();
    });

    //here we listen to the changes of the borwser current link
    this.paymentBrowser.on('loadstart').subscribe((event) => {
      var URLString = event["url"];

      //if we found on the link (Pay/SuccessPay) that mean user pay successfully
      //if we found on the link (Pay/CancelCreditCard) that mean user cancel the payment
      if (URLString.includes("Pay/SuccessPay")) {
        this.paymentBrowser.close();
      } else if (URLString.includes("Pay/CancelCreditCard")) {
        this.paymentBrowser.close();
      }
    });
  }

}
