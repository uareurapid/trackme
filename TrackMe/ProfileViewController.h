//
//  ProfileViewController.h
//  TrackMe
//
//  Created by PC Dreams on 04/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ProfileViewController : UITableViewController<NSURLConnectionDataDelegate>

@property (nonatomic) IBOutlet UIBarButtonItem* revealButtonItem;
@property (strong, nonatomic) NSMutableData *receivedData;
- (IBAction)btnLogoutClicked:(id)sender;
@property (strong,nonatomic) NSString *username;

@end
