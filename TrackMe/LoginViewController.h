//
//  ViewController.h
//  TrackMe
//
//  Created by Paulo Cristo on 18/06/15.
//  Copyright (c) 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import "Constants.h"

//last request
#define REQUEST_LOGIN 0
#define REQUEST_DEVICES_LIST 1
#define REQUEST_DEVICE_ADD 2
#define REQUEST_TRACKABLES_LIST 4
#define REQUEST_RECORD_ADD 5
#define REQUEST_SIGNUP 6

@interface LoginViewController : UIViewController<NSURLConnectionDataDelegate,CLLocationManagerDelegate,UITextFieldDelegate,UIAlertViewDelegate>
@property (weak, nonatomic) IBOutlet UIButton *btnLogin;

-(void) getDevicesList;

-(void)saveUsername:(NSString *) user;
@property (strong, nonatomic) IBOutlet UITextField *txtUsername;
@property (strong, nonatomic) IBOutlet UITextField *txtPassword;
@property (strong, nonatomic) NSMutableData *receivedData;
@property (strong, nonatomic) NSString *username;
@property (strong, nonatomic) NSString *deviceName;
@property (nonatomic) IBOutlet UIBarButtonItem* revealButtonItem;


- (IBAction)btnSignupClicked:(id)sender;
@property (weak, nonatomic) IBOutlet UIButton *btnSignup;

@property (weak, nonatomic) IBOutlet UISwitch *rememberMe;
- (IBAction)rememberMeChanged:(id)sender;
- (IBAction)loginClicked:(id)sender;
@property (weak, nonatomic) IBOutlet UILabel *lblCreateAccountHint;

-(void)callBackSuccess;

@end

