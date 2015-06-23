//
//  ViewController.m
//  TrackMe
//
//  Created by Paulo Cristo on 18/06/15.
//  Copyright (c) 2015 Paulo Cristo. All rights reserved.
//

#import "ViewController.h"


@interface ViewController ()
@property (strong, nonatomic) IBOutlet UITextField *txtUsername;
@property (strong, nonatomic) IBOutlet UITextField *txtPassword;
@property (strong, nonatomic) NSMutableData *receivedData;
@property (strong, nonatomic) NSString *username;
@property (strong, nonatomic) NSString *deviceName;


@end

@implementation ViewController

int lastRequest = -1;
bool deviceAlreadyAdded = false;
CLLocationManager *locationManager;

- (IBAction)loginClicked:(id)sender {
    
    /*NSData* postData= [<yourJSON> dataUsingEncoding:NSUTF8StringEncoding];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    [request setHTTPMethod:@"POST"];
    [request setValue:[NSString stringWithFormat:@"%d", postData.length] forHTTPHeaderField:@"Content-Length"];
    [request setValue:@"application/x-www-form-urlencoded charset=utf-8" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:postData];
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];*/
    
    //initialize new mutable data
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_LOGIN;
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.67/trackme/rest/login"]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
    //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
    NSString *postString = [NSString stringWithFormat:  @"username=%@&password=%@",self.txtUsername.text,self.txtPassword.text];
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
            
        case REQUEST_DEVICES_LIST:
            [self parseDevicesList:dict];
            break;
            
        case REQUEST_DEVICE_ADD:
            [self parseAddUserDevice: dict];
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
    
    self.deviceName = [[UIDevice currentDevice] name];
    NSLog(@"device name is %@",self.deviceName);
    BOOL devicePresent = false;
    
    id arrayDevices = [dict valueForKey:@"device_id"];

    if( arrayDevices!=nil && [arrayDevices isKindOfClass:NSArray.class]) {
        NSLog(@"is an array");
        NSArray *devicesList = (NSArray*)arrayDevices;
        for (id did in devicesList) {
            NSString *deviceId = (NSString *)did;
            NSLog(@"parsed device id %@",deviceId);
            if([deviceId isEqualToString:self.deviceName]) {
                devicePresent = true;
            }
            
        }
        if(!devicePresent && !deviceAlreadyAdded) {
            NSLog(@"Adding the device now");
            [self addUserDevice];
        }
    }
    else {
        NSLog(@"something is wrong");
    }
}

-(void) parseUserLogin: (NSDictionary *) dict {
    NSString *user = [dict valueForKey:@"email"];
    if(user!=nil) {
        NSLog(@"login ok");
        self.username = user;
        [self getDevicesList:user];
        
        //report current location
        [self getCurrentLocation];
    }
    else {
        NSLog(@"login failed");
    }
}

-(void) addUserDevice {
    if(self.deviceName!=nil && self.username!=nil) {
        
        self.receivedData = [[NSMutableData alloc] init];
        
        lastRequest = REQUEST_DEVICE_ADD;
        
        
        // Note that the URL is the "action" URL parameter from the form.
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://192.168.1.67/trackme/rest/device_add"]];
        [request setHTTPMethod:@"POST"];
        [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
        //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
        NSString *postString = [NSString stringWithFormat: @"device_id=%@&device_description=%@&device_owner=%@",self.deviceName,self.deviceName,self.username];
        NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
        [request setHTTPBody:data];
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
        
        NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                      delegate:self];
        
        [connection start];
    }
}

-(void) getDevicesList:(NSString *)username {
    
    self.receivedData = [[NSMutableData alloc] init];
    
    lastRequest = REQUEST_DEVICES_LIST;
    
    NSLog(@"TEST getDevicesList");
    
    NSString *getString = [NSString stringWithFormat:  @"http://192.168.1.67/trackme/rest/devices_list?username=%@",username];
    
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
        
        NSLog(@"lat: %@         long: %@",latitute,longitude);
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    locationManager = [[CLLocationManager alloc] init];
    
    self.txtPassword.delegate = self;
    self.txtUsername.delegate = self;
}

-(BOOL)textFieldShouldReturn:(UITextField *)textField{
    [textField resignFirstResponder];
    return true;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
