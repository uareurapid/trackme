//
//  MapViewController.m
//  TrackMe
//
//  Created by PC Dreams on 02/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import "MapViewController.h"
@import GoogleMaps;

@interface MapViewController ()

@property (strong, nonatomic) NSMutableData *receivedData;

@end

@implementation MapViewController

//DOCS HERE: https://developers.google.com/maps/documentation/ios-sdk/start?hl=en
GMSMapView *mapView_;


- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    // Create a GMSCameraPosition that tells the map to display the
    // coordinate -33.86,151.20 at zoom level 6.
    GMSCameraPosition *camera = [GMSCameraPosition cameraWithLatitude:-33.86
                                                            longitude:151.20
                                                                 zoom:6];
    mapView_ = [GMSMapView mapWithFrame:CGRectZero camera:camera];
    mapView_.myLocationEnabled = YES;
    self.view = mapView_;
    
    [self getRecordsList:@"cristo.paulo@gmail.com"];
    
    // Creates a marker in the center of the map.
    GMSMarker *marker = [[GMSMarker alloc] init];
    marker.position = CLLocationCoordinate2DMake(-33.86, 151.20);
    marker.title = @"Sydney";
    marker.snippet = @"Australia";
    marker.map = mapView_;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

//get trackables list (in future get just specific trackable)
//option to add new trackable or reuse existing
-(void) getRecordsList:(NSString *)username {
    
    self.receivedData = [[NSMutableData alloc] init];
    
    NSLog(@"TEST getRecordsList");
    
    NSString *getString = [NSString stringWithFormat:  @"http://192.168.1.66:8080/api/records?username=%@",username];
    
    // Note that the URL is the "action" URL parameter from the form.
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:getString]];
    [request setHTTPMethod:@"GET"];
    
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
    NSDictionary *dataDictionary = [NSJSONSerialization JSONObjectWithData:self.receivedData options:nil error:&e];
    
    
    //NSDictionary *dataDictionary = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    NSLog(@"dictionary records is: %@", dataDictionary);
    
    for(NSDictionary *record in dataDictionary) {
        NSString *lat = [record valueForKey:@"latitude"];
        NSString *lng = [record valueForKey:@"longitude"];
        
        NSLog(@"parsed latitude %@",lat);
        NSLog(@"parsed longitude %@",lng);
        
        // Creates a marker in the center of the map.
        GMSMarker *marker = [[GMSMarker alloc] init];
        marker.position = CLLocationCoordinate2DMake([lat doubleValue], [lng doubleValue]);
        marker.title = [record valueForKey:@"description"];
        marker.snippet = @"Australia";
        marker.map = mapView_;
    }
    
    
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
