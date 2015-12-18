//
//  NewTrackableController.m
//  TrackMe
//
//  Created by PC Dreams on 07/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import "NewTrackableController.h"
#import <Foundation/Foundation.h>
#import "Constants.h"

#import "Trackable.h"
#import "Trackable+CoreDataProperties.h"
#import <RestKit/RestKit.h>

@interface NewTrackableController ()
@property (weak, nonatomic) IBOutlet UITextField *txtName;
@property (weak, nonatomic) IBOutlet UITextField *txtDescription;
@property (weak, nonatomic) IBOutlet UISegmentedControl *type;
@property (weak, nonatomic) IBOutlet UISegmentedControl *privacy;

@end

@implementation NewTrackableController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.txtDescription.delegate=self;
    self.txtName.delegate=self;
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

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/
- (IBAction)btnCloseClicked:(id)sender {
    
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (IBAction)btnAddTrackableClicked:(id)sender {
    
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    NSString *user = [defaults objectForKey:USERNAME_KEY];
    NSString *token = [defaults objectForKey:ACCESS_TOKEN];
    
    if(user!=nil && self.txtName.text.length>0 && self.txtDescription.text.length > 0) {
        
      
        NSString *tType = [self.type titleForSegmentAtIndex:self.type.selectedSegmentIndex];
        NSString *tPrivacy = [self.privacy titleForSegmentAtIndex:self.privacy.selectedSegmentIndex];
        //else alert
        
        self.receivedData = [[NSMutableData alloc] init];
        
        NSString *requestUrl = [NSString stringWithFormat:@"%@%@",SERVER_LOCATION,API_ADD_TRACKABLE ];
        
        // Note that the URL is the "action" URL parameter from the form.
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:requestUrl]];
        [request setHTTPMethod:@"POST"];
        
        //ste the token in the headers
        [request setValue:[NSString stringWithFormat:@"Bearer %@",token ] forHTTPHeaderField:@"Authorization"];
        [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"content-type"];

        //this is hard coded based on your suggested values, obviously you'd probably need to make this more dynamic based on your application's specific data to send
        NSString *postString = [NSString stringWithFormat:  @"name=%@&description=%@&owner=%@&type=%@&privacy=%@",self.txtName.text,self.txtDescription.text,
                                user,tType,tPrivacy];
        
        NSLog(@"sending add trackable request: %@",postString);
        
        NSData *data = [postString dataUsingEncoding:NSUTF8StringEncoding];
        [request setHTTPBody:data];
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[data length]] forHTTPHeaderField:@"Content-Length"];
        
        NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                      delegate:self];
        
        [connection start];
    }
    
}
/*
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
 */

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
    NSLog(@"RECEIVED add trcakable response: %@" , htmlSTR);
    NSString *user = nil;
    NSError *e;
    NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:self.receivedData options:nil error:&e];
    
    if(dict!=nil && [dict objectForKey:@"_id"]!=nil) {
        
        NSManagedObjectContext *managedObjectContext = [RKManagedObjectStore defaultStore].mainQueueManagedObjectContext;
        
        Trackable *trackableModel = (Trackable *)[NSEntityDescription insertNewObjectForEntityForName:@"Trackable" inManagedObjectContext:managedObjectContext];
        
        trackableModel.identifier = [dict objectForKey:@"_id"];
        trackableModel.trackableName = [dict objectForKey:@"name"];
        trackableModel.trackableDescription = [dict objectForKey:@"description"];
        trackableModel.privacy = [dict objectForKey:@"privacy"];
        if(trackableModel.privacy!=nil && [trackableModel.privacy.lowercaseString isEqualToString:PRIVACY_PROTECTED]) {
            trackableModel.unlockCode = [dict objectForKey:@"unlockCode"];
        }

        //need to convert miliseconds string to NSDate
        NSDate *date = [NSDate dateWithTimeIntervalSince1970:([[dict objectForKey:@"creationDate"] doubleValue] / 1000)];//function accpets seconds, so since it comes in miliseconds divide by 1000
        
        trackableModel.creationDate = date;
        //not needed trackableModel.owner
        trackableModel.type = [dict objectForKey:@"type"];
        
        NSError *error;
        if(![managedObjectContext save:&error]){
            NSLog(@"Unable to save object, error is: %@",error.description);
            //This is a serious error saying the record
            //could not be saved. Advise the user to
            //try again or restart the application.
            
        }
        else {
            NSLog(@"save trackable ok");
            [self btnCloseClicked:self];
        }
    }
    /**
     RECEIVED add trcakable response: {"__v":0,"name":"myself","description":"track me","owner":"cristo.paulo@gmail.com","creationDate":"1450451419252","privacy":"Protected","type":"Person","unlockCode":"3fb2cdae-2ee1-4f1c-aaa0-3cfa80eac87c","_id":"567421db21f44cd00d114f76"}
     */
}

@end
