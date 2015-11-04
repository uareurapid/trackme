//
//  MenuViewController.m
//  SlideMenu
//
//  Created by Aryan Gh on 4/24/13.
//  Copyright (c) 2013 Aryan Ghassemi. All rights reserved.
//

#import "MenuViewController.h"
#import "MapViewController.h"
#import "SWRevealViewController.h"

@implementation SWUITableViewCell
@end


@implementation MenuViewController

- (void) prepareForSegue: (UIStoryboardSegue *) segue sender: (id) sender
{
    // configure the destination view controller:
    if ( [sender isKindOfClass:[UITableViewCell class]] )
    {
        UITableViewCell *cell = (UITableViewCell*)sender;
        NSString *identifier = [cell reuseIdentifier];
        
        NSLog(@"cell indentifier is: %@", identifier);
        
        /*if([identifier isEqualToString:@"map"]) {
            
        }
        else if([identifier isEqualToString:@"trackables"]) {
            
        }
        else if([identifier isEqualToString:@"devices"]) {
            
        }
        //UILabel* c = [(SWUITableViewCell *)sender label];
        UINavigationController *navController = segue.destinationViewController;
        MapViewController* cvc = [navController childViewControllers].firstObject;
        if ( [cvc isKindOfClass:[MapViewController class]] )
        {
           // cvc.color = c.textColor;
           // cvc.text = c.text;
        }*/
    }
}


#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return 6;
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    switch ( indexPath.row )
    {
        case 0:
            CellIdentifier = @"home";
            break;
        
        case 1:
            CellIdentifier = @"profile";
            break;
            
        case 2:
            CellIdentifier = @"trackables";
            break;
            
        case 3:
            CellIdentifier = @"devices";
            break;
            
        case 4:
            CellIdentifier = @"settings";
            break;
            
        case 5:
            CellIdentifier = @"map";
            break;
    }
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier: CellIdentifier forIndexPath: indexPath];
    
    return cell;
}

#pragma mark state preservation / restoration
- (void)encodeRestorableStateWithCoder:(NSCoder *)coder {
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // TODO save what you need here
    
    [super encodeRestorableStateWithCoder:coder];
}

- (void)decodeRestorableStateWithCoder:(NSCoder *)coder {
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // TODO restore what you need here
    
    [super decodeRestorableStateWithCoder:coder];
}

- (void)applicationFinishedRestoringState {
    NSLog(@"%s", __PRETTY_FUNCTION__);
    
    // TODO call whatever function you need to visually restore
}



@end