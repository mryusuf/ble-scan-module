//
//  BLEModule.m
//  blebridge
//
//  Created by Indra on 19/02/25.
//

#import <React/RCTBridgeModule.h>

@interface
RCT_EXTERN_MODULE(BLEModule, NSObject)

RCT_EXTERN_METHOD(startScanning)
RCT_EXTERN_METHOD(stopScanning)
@end
