//
//  DevicesViewController.m
//  TrackMe
//
//  Created by PC Dreams on 04/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import "DevicesViewController.h"
#import "SWRevealViewController.h"
#import "Constants.h"
#import "DeviceTableViewCell.h"
//check https://medium.com/ios-os-x-development/restkit-tutorial-how-to-fetch-data-from-an-api-into-core-data-9326af750e10

#import "Device.h"
#import "Device+CoreDataProperties.h"
#import <RestKit/RestKit.h>
#import <RestKit/CoreData.h>

@interface DevicesViewController ()

@end

@implementation DevicesViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self customSetup];
    self.devicesList = [[NSMutableArray alloc] init];
    
    NSUserDefaults *defaults=[NSUserDefaults standardUserDefaults];
    NSString *username = [defaults objectForKey:USERNAME_KEY];
    NSString *token = [defaults objectForKey:ACCESS_TOKEN];
    
    [self getDevicesList:username accessToken:token];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
-(void) getDevicesList:(NSString *)username accessToken:(NSString*) token{
    
    self.receivedData = [[NSMutableData alloc] init];
    
    
    NSLog(@"TEST getDevicesList");
    
    NSString *getString = [NSString stringWithFormat:  @"http://192.168.1.66:8080/api/devices?owner=%@",username];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:getString]];
    [request setHTTPMethod:@"GET"];
    [request setValue:token forHTTPHeaderField:@"x-access-token"];
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request
                                                                  delegate:self];
    
    [connection start];
}*/

//DELEGATES
/*
 this method might be calling more than one times according to incoming data size
 */
/*
-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    [self.receivedData appendData:data];
}*/
/*
 if there is an error occured, this method will be called by connection
 */
/*
-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    
    NSLog(@"%@" , error);
}*/

/*
 if data is successfully received, this method will be called by connection
 */
/*
-(void)connectionDidFinishLoading:(NSURLConnection *)connection{
    
    //initialize convert the received data to string with UTF8 encoding
    NSString *htmlSTR = [[NSString alloc] initWithData:self.receivedData
                                              encoding:NSUTF8StringEncoding];
    NSLog(@"RECEIVED devices response: %@" , htmlSTR);
    NSString *user = nil;
    NSError *e;
    NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:self.receivedData options:nil error:&e];
    
    [self parseDevicesList:dict];
    
}*/

//parse parseDevicesList list
/*-(void) parseDevicesList: (NSDictionary *) dict {
    
    //for now i´ll add just the name TODO model
    id arrayDevices = [dict valueForKey:@"deviceId"];
    
    if( arrayDevices!=nil && [arrayDevices isKindOfClass:NSArray.class]) {
        NSLog(@"is an array");
        NSArray *devList = (NSArray*)arrayDevices;
        for (id tid in devList) {
            NSString *deviceId = (NSString *)tid;
            NSLog(@"parsed device name %@",deviceId);
            //if(![self.trackablesList valueForKey:trackableName]) {
            //not present yet, add it
            NSLog(@"adding device %@",deviceId);
            [self.devicesList addObject:deviceId];
            //}
            //else {
            //    NSLog(@"already present trackable %@",trackableName);
            //}
            
        }
    }
    [self.tableView reloadData];
}*/

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (void)customSetup
{
    SWRevealViewController *revealViewController = self.revealViewController;
    if ( revealViewController )
    {
        [self.revealButtonItem setTarget: revealViewController];
        [self.revealButtonItem setAction: @selector( revealToggle: )];
        [self.navigationController.navigationBar addGestureRecognizer:revealViewController.panGestureRecognizer];
    }
    
    //_label.text = _text;
    //_label.textColor = _color;
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.devicesList.count;
}

//selected a trackable
- (void)tableView:(UITableView *)tableView didDeselectRowAtIndexPath:(nonnull NSIndexPath *)indexPath {
    
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    Device *device = [self.devicesList objectAtIndex:indexPath.row];
    
    DeviceTableViewCell *cell = (DeviceTableViewCell*)[tableView dequeueReusableCellWithIdentifier: CellIdentifier forIndexPath: indexPath];
    
    NSLog(@"adding to the cell label: %@",device);
    cell.deviceId.text = device.deviceId;
    
    return cell;
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

#pragma mark - RESTKit

- (void) getDevicesList:(NSString *)username accessToken:(NSString*) token {
    
    NSString *requestPath = @"/api/devices";
    
    //[[RKObjectManager sharedManager] HTTPHeaders] setValue:myValue
                                                         //     forKey:myHeaderName];
    //Here is my custom header code
    RKObjectManager *objectManager = [RKObjectManager sharedManager];
    [objectManager.HTTPClient setDefaultHeader:@"x-access-token" value:token];
    //End of custom header code
    
    [objectManager
     getObjectsAtPath:requestPath
     parameters:nil
     success: ^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
         //articles have been saved in core data by now
         [self fetchDevicesFromContext];
     }
     failure: ^(RKObjectRequestOperation *operation, NSError *error) {
         RKLogError(@"Load failed with error: %@", error);
     }
     ];
    
}

- (void) fetchDevicesFromContext {
    
    NSManagedObjectContext *context = [RKManagedObjectStore defaultStore].mainQueueManagedObjectContext;
    
    //[request setHTTPMethod:@"GET"];
    //[request setValue:token forHTTPHeaderField:@"x-access-token"];
    
    NSFetchRequest *fetchRequest = [NSFetchRequest fetchRequestWithEntityName:@"Device"];
    
    NSSortDescriptor *descriptor = [NSSortDescriptor sortDescriptorWithKey:@"identifier" ascending:YES];
    fetchRequest.sortDescriptors = @[descriptor];
    
    NSError *error = nil;
    NSArray *fetchedObjects = [context executeFetchRequest:fetchRequest error:&error];
    
    //Device *articleList = [fetchedObjects firstObject];
    
    [self.devicesList addObjectsFromArray:fetchedObjects];
    
    [self.tableView reloadData];
    
}

@end

