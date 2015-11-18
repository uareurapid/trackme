//
//  Trackable+CoreDataProperties.h
//  TrackMe
//
//  Created by PC Dreams on 17/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//
//  Choose "Create NSManagedObject Subclass…" from the Core Data editor menu
//  to delete and recreate this implementation file for your updated model.
//

#import "Trackable.h"

NS_ASSUME_NONNULL_BEGIN

@interface Trackable (CoreDataProperties)

@property (nullable, nonatomic, retain) NSString *identifier;
@property (nullable, nonatomic, retain) NSString *trackableName;
@property (nullable, nonatomic, retain) NSString *trackableDescription;
@property (nullable, nonatomic, retain) NSString *type;
@property (nullable, nonatomic, retain) NSString *privacy;
@property (nullable, nonatomic, retain) NSDate *creationDate;
@property (nullable, nonatomic, retain) NSString *unlockCode;

@end

NS_ASSUME_NONNULL_END
