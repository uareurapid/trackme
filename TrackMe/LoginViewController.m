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
    
    
    if([self.btnLogin.titleLabel.text isEqualToString:@"Signup"]) {
        //am performing  signup
        [self performSignupRequest];
    }
    else {
        //normal login
        [self performLoginRequest];
    }
    
    
    
}

//LOGIN
-(void) performLoginRequest {
    //initialize new mutable data
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_LOGIN;
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.66:8080/rlogin"]];
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
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.66:8080/rsignup"]];
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
    if(buttonIndex==1) {
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

-(void) parseUserLogin: (NSDictionary *) dict {
    NSString *user = [dict valueForKey:@"email"];
    if(user!=nil) {
        NSLog(@"login ok for username %@",user);
        self.username = user;
        
        //save the credentials
        [self rememberMeChanged:self ];
        
        //get the devices and check for this one
        [self checkIfDeviceExists:user];
        
        //SWRevealViewController *revealViewController = self.revealViewController;
        //[self presentViewController:revealViewController animated:YES completion:nil];
        
        //get devices list
        /*[self getDevicesList:user];
        
        //report current location
        [self getCurrentLocation];*/
    }
    else {
        NSLog(@"login failed");
    }
}

-(void) parseUserSignup: (NSDictionary *) dict {
    NSString *user = [dict valueForKey:@"email"];
    if(user!=nil) {
        NSLog(@"login ok for username %@",user);
        self.username = user;
        
        //save the credentials
        [self rememberMeChanged:self ];
        
        //get devices list and add this one
        [self getDevicesList: user];
        
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

-(void) getDevicesList:(NSString *)username {
    
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_DEVICES_LIST;
    
    NSLog(@"TEST getDevicesList");
    
    NSString *getString = [NSString stringWithFormat:  @"http://192.168.1.66:8080/api/devices?username=%@",username];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:getString]];
    [request setHTTPMethod:@"GET"];
    //[request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    
    //NSData *data = [getString dataUsingEncoding:NSUTF8StringEncoding];
    //[request setHTTPBody:data];
    //[request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
    
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
    
 
   // self.btnLoginSignup.titleLabel.text = @"Login";
    
    
    //prefills if there is saved data
    [self prefillUserFields];
    
    [self customSetup];
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
        [self getDevicesList: username];
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
    //hide this one
    self.btnSignup.hidden = true;
    //change the label of the other one
    self.btnLogin.titleLabel.text = @"Signup";
    //hidde the hint
    self.lblCreateAccountHint.hidden = true;
    
    //clear these
    self.txtPassword.text=@"";
    self.txtPassword.text=@"";
    
    //perform signup and hidde them again
    
    //self.lblRetypePassword.hidden = true;
    //self.txtRetypePassword.hidden = true;
}
@end
