package com.dapi.app;

import com.facebook.react.ReactActivity;
import android.os.Bundle;
import android.content.Intent;

public class MainActivity extends ReactActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    
    super.onCreate(savedInstanceState);

    if (!isTaskRoot() && getIntent().hasCategory(Intent.CATEGORY_LAUNCHER) && getIntent().getAction() != null
        && getIntent().getAction().equals(Intent.ACTION_MAIN)) {

      finish();
      return;
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "example";
  }

}
