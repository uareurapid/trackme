//
//  NewTrackableController.h
//  TrackMe
//
//  Created by PC Dreams on 07/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface NewTrackableController : UIViewController<NSURLConnectionDataDelegate,UITextFieldDelegate>

@property (strong, nonatomic) NSMutableData *receivedData;

@end
