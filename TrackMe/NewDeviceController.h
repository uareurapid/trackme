//
//  NewDeviceController.h
//  TrackMe
//
//  Created by PC Dreams on 09/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "LoginViewController.h"

@interface NewDeviceController : UIViewController<NSURLConnectionDataDelegate,UITextFieldDelegate>

@property (strong, nonatomic) NSMutableData *receivedData;
@property (strong,nonatomic) NSString *deviceIdentifier;
@property (weak,nonatomic) LoginViewController *callbackController;
@property (weak, nonatomic) IBOutlet UITextField *txtIdentifier;
@property (weak, nonatomic) IBOutlet UITextField *txtDescription;
- (IBAction)addDeviceClicked:(id)sender;
- (IBAction)btnCloseClicked:(id)sender;

@end
