//
//  NewDeviceController.m
//  TrackMe
//
//  Created by PC Dreams on 09/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import "NewDeviceController.h"
#import "Constants.h"

@interface NewDeviceController ()

@end

@implementation NewDeviceController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.txtDescription.delegate = self;
    self.txtIdentifier.delegate = self;
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];
    
    return YES;
}

-(void) viewWillAppear:(BOOL)animated{
    self.txtIdentifier.text = self.deviceIdentifier;
}

//[self performSegueWithIdentifier:@"segue_reveal" sender:nil];

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (IBAction)addDeviceClicked:(id)sender {
    
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    NSString* username = [defaults objectForKey:USERNAME_KEY];
    NSString* token = [defaults objectForKey:ACCESS_TOKEN];
    
    if(username!=nil && self.txtDescription.text.length>0 && self.txtDescription.text.length > 0) {
        
        
        //NSString *tType = [self.type titleForSegmentAtIndex:self.type.selectedSegmentIndex];
        //NSString *tPrivacy = [self.privacy titleForSegmentAtIndex:self.privacy.selectedSegmentIndex];
        //else alert
        
        self.receivedData = [[NSMutableData alloc] init];
        
        NSString *requestUrl = [NSString stringWithFormat:@"%@%@",SERVER_LOCATION,API_ADD_DEVICE ];
        
        // Note that the URL is the "action" URL parameter from the form.
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:requestUrl]];
        [request setHTTPMethod:@"POST"];
        
        [request setValue:[NSString stringWithFormat:@"Bearer %@",token ] forHTTPHeaderField:@"Authorization"];
        [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];
        
        //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
        NSString *postString = [NSString stringWithFormat:  @"deviceId=%@&deviceDescription=%@&owner=%@",self.txtIdentifier.text,self.txtDescription.text,
                                username];
        
        NSLog(@"sending add device request: %@",postString);
        
        NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
        [request setHTTPBody:data];
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
        
        NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                      delegate:self];
        
        [connection start];
    }
    
}

- (IBAction)btnCloseClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion:^{
        //perform the segue and open the reveal controller
        [self.callbackController callBackSuccess];
    }];
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
    NSLog(@"RECEIVED add device response: %@" , htmlSTR);
    NSString *user = nil;
    NSError *e;
    NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:self.receivedData options:nil error:&e];
    
    //NSMutableArray *devicesList = [[NSMutableArray alloc] init];
    BOOL added = false;
    
    id arrayDevices = [dict valueForKey:@"deviceId"];
    //this way i just check the device id field
    //to get all fields check the example of the records on the map view controller:
    /**
     for(NSDictionary *record in dict) {
     NSString *lat = [record valueForKey:@"latitude"];
     NSString *lng = [record valueForKey:@"longitude"];
     */
    if( arrayDevices!=nil && [arrayDevices isKindOfClass:NSArray.class]) {
        NSLog(@"is an array");
        NSArray *devicesList = (NSArray*)arrayDevices;
        for (id did in devicesList) {
            NSString *deviceId = (NSString *)did;
            NSLog(@"parsed device id %@",deviceId);
            if([deviceId isEqualToString:self.deviceIdentifier]) {
                NSLog(@"successfully added the device: %@",deviceId);
                added = true;
            }
            
        }
    }

    
    if(added) {
        NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
        [defaults setObject:self.deviceIdentifier forKey:DEVICE_IDENTIFIER];
        
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Add device"
                                                        message:@"Device successfully added!"
                                                       delegate:nil
                                              cancelButtonTitle:nil
                                              otherButtonTitles:@"Yes", nil];
        alert.delegate = self;
        [alert show];
    
        
    }

}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    [self btnCloseClicked:self];
}

@end
