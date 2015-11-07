//
//  Trackable.m
//  TrackMe
//
//  Created by PC Dreams on 07/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import "Trackable.h"

@implementation Trackable


-(id) initWithName: (NSString*) name description:(NSString*) desc type: (NSString*) trackableType privacy:(NSString*) trackablePrivacy owner:(NSString *)trackableOwner {
    
    self = [super init];
    
    self.name = name;
    self.description = desc;
    self.type = trackableType;
    self.privacy = trackablePrivacy;
    self.owner = trackableOwner;
    
    return self;
}
@end
