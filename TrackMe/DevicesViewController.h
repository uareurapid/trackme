//
//  DevicesViewController.h
//  TrackMe
//
//  Created by PC Dreams on 04/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface DevicesViewController : UITableViewController<NSURLConnectionDataDelegate>
@property (nonatomic) IBOutlet UIBarButtonItem* revealButtonItem;
@property (strong, nonatomic) NSMutableData *receivedData;
@property (strong, nonatomic) NSMutableArray *devicesList;

- (NSArray *) fetchDevicesFromContext: (NSString*) username;
- (void) getDevicesListForUser: (NSString *) username andToken:(NSString*) token;
@end
