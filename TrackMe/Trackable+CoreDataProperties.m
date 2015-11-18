//
//  Trackable+CoreDataProperties.m
//  TrackMe
//
//  Created by PC Dreams on 17/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//
//  Choose "Create NSManagedObject Subclass…" from the Core Data editor menu
//  to delete and recreate this implementation file for your updated model.
//

#import "Trackable+CoreDataProperties.h"

@implementation Trackable (CoreDataProperties)

@dynamic identifier;
@dynamic trackableName;
@dynamic trackableDescription;
@dynamic type;
@dynamic privacy;
@dynamic creationDate;
@dynamic unlockCode;

@end
