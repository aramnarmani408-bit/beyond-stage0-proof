package com.beyond.hello

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

// One screen: the BEYOND Hello greeting (English + Pashto).
class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = TextView(this)
        view.text = "BEYOND Hello — سلام! پښتو ته ښه راغلاست"
        view.textSize = 20f
        view.setPadding(48, 48, 48, 48)
        setContentView(view)
    }
}
