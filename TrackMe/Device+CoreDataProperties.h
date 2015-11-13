//
//  Device+CoreDataProperties.h
//  TrackMe
//
//  Created by PC Dreams on 12/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//
//  Choose "Create NSManagedObject Subclass…" from the Core Data editor menu
//  to delete and recreate this implementation file for your updated model.
//

#import "Device.h"

NS_ASSUME_NONNULL_BEGIN

@interface Device (CoreDataProperties)

@property (nullable, nonatomic, retain) NSString *identifier;
@property (nullable, nonatomic, retain) NSString *deviceId;
@property (nullable, nonatomic, retain) NSString *deviceDescription;
@property (nullable, nonatomic, retain) NSString *deviceOwner;

@end

NS_ASSUME_NONNULL_END
