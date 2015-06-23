//
//  ViewController.h
//  TrackMe
//
//  Created by Paulo Cristo on 18/06/15.
//  Copyright (c) 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

//last request
#define REQUEST_LOGIN 0
#define REQUEST_DEVICES_LIST 1
#define REQUEST_DEVICE_ADD 2

@interface ViewController : UIViewController<NSURLConnectionDataDelegate,CLLocationManagerDelegate,UITextFieldDelegate>

-(void) getDevicesList;

@end

