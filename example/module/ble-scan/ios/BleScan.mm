#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BleScan, NSObject)

RCT_EXTERN_METHOD(startScanning)
RCT_EXTERN_METHOD(stopScanning)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
