//
//  SettingsViewController.h
//  TrackMe
//
//  Created by PC Dreams on 04/11/15.
//  Copyright © 2015 Paulo Cristo. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SettingsViewController : UIViewController<UIPickerViewDelegate,UIPickerViewDataSource>
@property (nonatomic) IBOutlet UIBarButtonItem* revealButtonItem;
@property (weak, nonatomic) IBOutlet UIPickerView *batchSizePicker;
@property (weak, nonatomic) IBOutlet UIPickerView *updateIntervalPicker;




@end
