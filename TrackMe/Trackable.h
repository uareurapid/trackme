//
//  Trackable.h
//  TrackMe
//
//  Created by PC Dreams on 07/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Trackable : NSObject

@property (strong,nonatomic) NSString *name;
@property (strong,nonatomic) NSString *description;
@property (strong,nonatomic) NSString *owner;
@property (strong,nonatomic) NSString *type;
@property (strong,nonatomic) NSString *privacy;
@end
