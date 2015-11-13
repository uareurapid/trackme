//
//  TrackablesViewController.h
//  TrackMe
//
//  Created by PC Dreams on 04/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TrackablesViewController : UITableViewController<NSURLConnectionDataDelegate>
@property (nonatomic) IBOutlet UIBarButtonItem* revealButtonItem;
@property (strong, nonatomic) NSMutableData *receivedData;
@property (strong, nonatomic) NSMutableArray *trackablesList;
@end
