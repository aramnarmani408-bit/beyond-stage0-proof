package com.beyondx.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(BeyondXBridge.class);
    registerPlugin(BeyondXControl.class);
    registerPlugin(BeyondXActions.class);
    registerPlugin(BeyondXStore.class);
    super.onCreate(savedInstanceState);
  }
}
