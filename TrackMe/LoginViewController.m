//
//  ViewController.m
//  TrackMe
//
//  Created by Paulo Cristo on 18/06/15.
//  Copyright (c) 2015 Paulo Cristo. All rights reserved.
//

#import "LoginViewController.h"
#import "SWRevealViewController.h"
#import "SSKeychain.h"
#import <Foundation/Foundation.h>
#import "NewDeviceController.h"

@interface LoginViewController ()



@end

@implementation LoginViewController

int lastRequest = -1;
bool deviceAlreadyAdded = false;
CLLocationManager *locationManager;
NSMutableArray *trackablesList;
bool addedRecord = false;
const NSString *server = @"192.168.1.66:8080";


- (IBAction)loginClicked:(id)sender {
    
    
    [self checkInputFields];
}

//check if all in place
-(void) checkInputFields {
    
    if(self.txtUsername.text.length==0 || self.txtPassword.text.length==0) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: (self.isSignup? @"Signup": @"Login") message: @"Missing credentials!" delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"OK",nil];
        alert.tag = 100;
        alert.alertViewStyle = UIAlertViewStyleDefault;
        
        [alert show];
    }
    else if(![self NSStringIsValidEmail:self.txtUsername.text]) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: (self.isSignup? @"Signup": @"Login") message: @"Invalid email address!" delegate:self cancelButtonTitle:@"Cancel" otherButtonTitles:@"OK",nil];
        alert.tag = 101;
        alert.alertViewStyle = UIAlertViewStyleDefault;
        
        [alert show];
    }
    else {
        if(self.isSignup) {
            NSLog(@"do signup");
            //i am performing a signup
            [self performSignupRequest];
        }
        else {
             NSLog(@"do login");
            //i am doing a normal login
            [self performLoginRequest];
        }
    }
    
    
}

-(BOOL) NSStringIsValidEmail:(NSString *)checkString
{
    BOOL stricterFilter = NO; // Discussion http://blog.logichigh.com/2010/09/02/validating-an-e-mail-address/
    NSString *stricterFilterString = @"^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$";
    NSString *laxString = @"^.+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2}[A-Za-z]*$";
    NSString *emailRegex = stricterFilter ? stricterFilterString : laxString;
    NSPredicate *emailTest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", emailRegex];
    return [emailTest evaluateWithObject:checkString];
}

//LOGIN
-(void) performLoginRequest {
    //initialize new mutable data
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_LOGIN;
    
    NSString *url = [NSString stringWithFormat:@"%@/rlogin",SERVER_LOCATION ];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    NSString *postString = [NSString stringWithFormat:  @"email=%@&password=%@",self.txtUsername.text,self.txtPassword.text];
    NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
    [request setHTTPBody:data];
    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}

-(void) performSignupRequest {
    //initialize new mutable data
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_SIGNUP;
    
    //TODO check if password and retype are equal!!!
    NSString *url = [NSString stringWithFormat:@"%@%@",SERVER_LOCATION,@"/rsignup"];
    
    NSLog(@"POST TO %@",url);
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    NSString *postString = [NSString stringWithFormat:  @"email=%@&password=%@",self.txtUsername.text,self.txtPassword.text];
    NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
    [request setHTTPBody:data];
    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}

//DELEGATES
/*
 this method might be calling more than one times according to incoming data size
 */
-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    [self.receivedData appendData:data];
}
/*
 if there is an error occured, this method will be called by connection
 */
-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    
    NSLog(@"%@" , error);
}

/*
 if data is successfully received, this method will be called by connection
 */
-(void)connectionDidFinishLoading:(NSURLConnection *)connection{
    
    //initialize convert the received data to string with UTF8 encoding
    NSString *htmlSTR = [[NSString alloc] initWithData:self.receivedData
                                              encoding:NSUTF8StringEncoding];
    NSLog(@"RECEIVED %@" , htmlSTR);
    NSString *user = nil;
    NSError *e;
    NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:self.receivedData options:nil error:&e];
    
    
    switch (lastRequest) {
            
        case REQUEST_LOGIN:
            [self parseUserLogin: dict];
            break;
            
        case REQUEST_SIGNUP:
            [self parseUserSignup: dict];
            break;
            
        case REQUEST_DEVICES_LIST:
            [self parseDevicesList:dict];
            //now get trackables list
            //[self getTrackablesList:user];
            break;
            
        case REQUEST_DEVICE_ADD:
            [self parseAddUserDevice: dict];
            break;
            
        case REQUEST_TRACKABLES_LIST:
            [self parseTrackablesList: dict];
            break;
            
        default:
            break;
    }
    
    
    
    //initialize a new webviewcontroller
    //WebViewController *controller = [[WebViewController alloc] initWithString:htmlSTR];
    
    //show controller with navigation
    //[self.navigationController pushViewController:controller animated:YES];
}

-(void )parseAddUserDevice: (NSDictionary *) dict {
    if([dict valueForKey:@"id"]!=nil) {
        //means successfully added it
        deviceAlreadyAdded = true;
    }
    else {
        deviceAlreadyAdded = false;
    }
}

-(void) parseDevicesList: (NSDictionary *) dict {
    
    //we double check if a device with same identifier was not created outside (that´s why we don´t blindly trust the nsdefaults)
    NSLog(@"PARSING DEVICES LIST");
    self.deviceName = [[UIDevice currentDevice] name];
    NSLog(@"device name is %@",self.deviceName);
    BOOL devicePresent = false;
    
    id arrayDevices = [dict valueForKey:@"deviceId"];

    if( arrayDevices!=nil && [arrayDevices isKindOfClass:NSArray.class]) {
        NSLog(@"is an array");
        NSArray *devicesList = (NSArray*)arrayDevices;
        for (id did in devicesList) {
            NSString *deviceId = (NSString *)did;
            NSLog(@"parsed device id %@",deviceId);
            if([deviceId isEqualToString:self.deviceName]) {
                devicePresent = true;
                NSLog(@"already added this device, skipping it...");
            }
            
        }
        if(!devicePresent && !deviceAlreadyAdded) {
        
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Add new tracking device"
                                                            message:@"Do you want to use this device as a new tracking device."
                                                           delegate:nil
                                                  cancelButtonTitle:@"No"
                                                  otherButtonTitles:@"Yes", nil];
            alert.tag = 102;
            alert.delegate = self;
            [alert show];
    
            
        }
        else {
            //already added this device, perform the segue
            [self performSegueWithIdentifier:@"segue_reveal" sender:nil];
        }
    }
    else {
        NSLog(@"something is wrong");
    }
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    if(alertView.tag==102 && buttonIndex==1) {
       //pressed "yes"
        //we show the controller to allow pass a description
            NewDeviceController * controller = [self.storyboard instantiateViewControllerWithIdentifier:@"NewDeviceController"];
            //we pass the device identifier as param
            controller.deviceIdentifier = self.deviceName;
            controller.callbackController = self;
            [self presentViewController:controller animated:NO completion:nil];
        
            //UIStoryboard *storyboard = [UIStoryboard sto
    }
}

-(void)callBackSuccess {
    //already added this device, perform the segue
    [self performSegueWithIdentifier:@"segue_reveal" sender:nil];
}

//parse trackables list
-(void) parseTrackablesList: (NSDictionary *) dict {
    if(trackablesList==nil) {
        trackablesList = [[NSMutableArray alloc] init];
    }
    
        id arrayTrackables = [dict valueForKey:@"name"];
        
        if( arrayTrackables!=nil && [arrayTrackables isKindOfClass:NSArray.class]) {
            NSLog(@"is an array");
            NSArray *trackList = (NSArray*)arrayTrackables;
            for (id tid in trackList) {
                NSString *trackableName = (NSString *)tid;
                NSLog(@"parsed trackable id/name %@",trackableName);
                if([trackablesList valueForKey:trackableName]==nil) {
                    //not present yet, add it
                    [trackablesList addObject:trackableName];
                }
                else {
                    NSLog(@"already present trackable %@",trackableName);
                }
                
            }
        }
}

//parse user login request
-(void) parseUserLogin: (NSDictionary *) dict {
    
    NSString *user = [dict valueForKey:@"email"];
    NSString *token = [dict valueForKey:@"token"];
    
    if(user!=nil) {
        NSLog(@"login ok for username %@",user);
        NSLog(@"token is %@",token);
        
        self.username = user;
        
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        [defaults setObject:token forKey:ACCESS_TOKEN];
        
        //save the credentials
        [self rememberMeChanged:self ];
        
        //get the devices and check for this one
        [self checkIfDeviceExists:user];
 
    }
    else {
        NSLog(@"login failed");
    }
}

-(void) parseUserSignup: (NSDictionary *) dict {
    
    NSString *user = [dict valueForKey:@"email"];
    NSString *token = [dict valueForKey:@"token"];
    
    if(user!=nil) {
        NSLog(@"login ok for username %@",user);
        self.username = user;
        
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        [defaults setObject:token forKey:ACCESS_TOKEN];
        
        //save the credentials
        [self rememberMeChanged:self ];
        
        //get devices list and add this one
        [self getDevicesList: user accessToken: token];
        
        //open reveal controller
        //[self performSegueWithIdentifier:@"segue_reveal" sender:nil];
    
    }
    else {
        NSLog(@"login failed");
    }
}

-(void)saveUsername:(NSString *) user {
   
}

/*-(void) addUserDevice {
    if(self.deviceName!=nil && self.username!=nil) {
        
        self.receivedData = [[NSMutableData alloc] init];
        
        lastRequest = REQUEST_DEVICE_ADD;
        
        
        // Note that the URL is the "action" URL parameter from the form.
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.66:8080/api/devices"]];
        [request setHTTPMethod:@"POST"];
        [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
        //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
        NSString *postString = [NSString stringWithFormat: @"deviceId=%@&deviceDescription=%@&deviceOwner=%@",self.deviceName,self.deviceName,self.username];
        NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
        [request setHTTPBody:data];
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
        
        NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                      delegate:self];
        
        [connection start];
    }
}*/

-(void) getDevicesList:(NSString *)username accessToken:(NSString*) token{
    
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_DEVICES_LIST;
    
    NSLog(@"TEST getDevicesList");
    
    NSString *getString = [NSString stringWithFormat:  @"%@/api/devices",SERVER_LOCATION];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:getString]];
    [request setHTTPMethod:@"GET"];
    //[request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    
    //NSData *data = [getString dataUsingEncoding:NSUTF8StringEncoding];
    //[request setHTTPBody:data];
    [request setValue: [NSString stringWithFormat:@"Bearer %@", token ] forHTTPHeaderField:@"Authorization"];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}

//get trackables list
-(void) getTrackablesList:(NSString *)username {
    
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_TRACKABLES_LIST;
    
    NSLog(@"TEST getTrackablesList");
    
    NSString *getString = [NSString stringWithFormat:  @"http://192.168.1.66:8080/api/trackables?username=%@",username];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:getString]];
    [request setHTTPMethod:@"GET"];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}

-(void)addRecord: (NSString*) name withDescription:(NSString*) description withDeviceId: (NSString *)deviceId withTrackableId:(NSString *)trackableId
                forLatitude:(NSString *)latitude forLongitude:(NSString *) longitude{
    //name,description,latitude,longitude,device_id,trackable_id
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_RECORD_ADD;
    
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.66:8080/api/records"]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    NSString *postString = [NSString stringWithFormat: @"device_id=%@&trackable_id=%@&name=%@&description=%@&latitude=%@&longitude=%@",deviceId,trackableId,name,description,latitude,longitude];
    NSLog(@"the POST PARAMS ARE: %@",postString);
    
    NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
    [request setHTTPBody:data];
    [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}

- (void)getCurrentLocation {
    NSLog(@"Get current location now...");
    locationManager.delegate = self;
    locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    [locationManager startUpdatingLocation];
}


//http://www.appcoda.com/how-to-get-current-location-iphone-user/
#pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"didFailWithError: %@", error);
    UIAlertView *errorAlert = [[UIAlertView alloc]
                               initWithTitle:@"Error" message:@"Failed to Get Your Location" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
    [errorAlert show];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation
{
    NSLog(@"didUpdateToLocation: %@", newLocation);
    CLLocation *currentLocation = newLocation;
    
    if (currentLocation != nil) {
        NSString *longitude = [NSString stringWithFormat:@"%.8f", currentLocation.coordinate.longitude];
        NSString *latitute = [NSString stringWithFormat:@"%.8f", currentLocation.coordinate.latitude];
        
        if(!addedRecord) {
            NSLog(@"adding record NOW!!!");
            
            //TODO THIS IS OK
            //[self addRecord:@"added_from_device" withDescription:@"rec_description" withDeviceId:@"12" withTrackableId:@"9" forLatitude:latitute forLongitude:longitude];
        }
        
        NSLog(@"lat: %@         long: %@",latitute,longitude);
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Do any additional setup after loading the view, typically from a nib.
    locationManager = [[CLLocationManager alloc] init];
    
    self.txtPassword.delegate = self;
    self.txtUsername.delegate = self;
    //clear any previous stuff
    self.txtPassword.text = @"";
    self.txtUsername.text = @"";
 
    self.isSignup = false;
    
    //prefills if there is saved data
    [self prefillUserFields];
    [self customSetup];
    //[self checkExistingCredentials];
}

-(BOOL)textFieldShouldReturn:(UITextField *)textField{
    [textField resignFirstResponder];
    return true;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)customSetup
{
    SWRevealViewController *revealViewController = self.revealViewController;
    if ( revealViewController )
    {
        NSLog(@"yes it exists");
        [self.revealButtonItem setTarget: revealViewController];
        [self.revealButtonItem setAction: @selector( revealToggle: )];
        [self.navigationController.navigationBar addGestureRecognizer:revealViewController.panGestureRecognizer];
    }
    
    //_label.text = _text;
    //_label.textColor = _color;
}

#pragma mark state preservation / restoration

- (void)encodeRestorableStateWithCoder:(NSCoder *)coder
{
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // Save what you need here
    //[coder encodeObject: _text forKey: @"text"];
    //[coder encodeObject: _color forKey: @"color"];
    
    [super encodeRestorableStateWithCoder:coder];
}

-(void) checkExistingCredentials {
    
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    NSString* user = [defaults objectForKey:USERNAME_KEY];
    NSString *pass =[SSKeychain passwordForService:@"trackme_service" account:user];
    NSString *token = [defaults objectForKey:ACCESS_TOKEN];
    if(user!=nil && pass!=nil && token!=nil) {
        //[self performSegueWithIdentifier:@"segue_reveal" sender:nil];
    }
}

- (IBAction)rememberMeChanged:(id)sender;
{
    if(self.rememberMe.on == YES)
    {
        
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        NSString* user = self.txtUsername.text;
        [defaults setObject:user forKey:USERNAME_KEY];
        [defaults synchronize];
        
        NSString *pass = self.txtPassword.text;
        //[defaults setObject:pass forKey:@"textField2Text"];
        
        //save the password on keychain
        [SSKeychain setPassword:pass forService:@"trackme_service" account:user];
        
        
    }
    
}

-(void) checkIfDeviceExists: (NSString *) username{
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    if([defaults objectForKey:DEVICE_IDENTIFIER ]==nil) {
        //the device does not exists yet, add it
        NSString *token = [defaults objectForKey:ACCESS_TOKEN];
        [self getDevicesList: username accessToken: token ];
    }
    else {
        //open reveal controller
        [self performSegueWithIdentifier:@"segue_reveal" sender:nil];
    }
}

-(void) prefillUserFields {
    
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    NSString* user = [defaults objectForKey:USERNAME_KEY];
    
    if(user!=nil) {
        self.txtUsername.text = user;
        NSString *pass = [SSKeychain passwordForService:@"trackme_service" account:user];
        if(pass!=nil) {
            self.txtPassword.text = pass;
        }
    }

}

- (void)decodeRestorableStateWithCoder:(NSCoder *)coder
{
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // Restore what you need here
    //_color = [coder decodeObjectForKey: @"color"];
    //_text = [coder decodeObjectForKey: @"text"];
    
    [super decodeRestorableStateWithCoder:coder];
}


- (void)applicationFinishedRestoringState
{
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // Call whatever function you need to visually restore
    [self customSetup];
}


- (IBAction)btnSignupClicked:(id)sender{
    
    self.isSignup = !self.isSignup;
    NSLog(@"clicked....");
    if(self.isSignup) {
        //change the label of the other one
        [self.btnLogin setTitle:@"Signup" forState:UIControlStateNormal];
        //change the text of this label
        self.lblCreateAccountHint.text = @"Already have an account?";
        //change the title of the button
        [self.btnSignup setTitle: @"Login" forState:UIControlStateNormal];
    }
    else {
        //change the label of the other one
        [self.btnLogin setTitle:@"Login" forState:UIControlStateNormal];
        //change the text of this label
        self.lblCreateAccountHint.text = @"Don´t have an account yet?";
        //change the title of the button
        [self.btnSignup setTitle:@"Signup" forState:UIControlStateNormal];
    }
    
    
    //clear fields
    self.txtUsername.text=@"";
    self.txtPassword.text=@"";
    
    //perform signup and hidde them again

}
@end
