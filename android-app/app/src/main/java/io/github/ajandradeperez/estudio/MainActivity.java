package io.github.ajandradeperez.estudio;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugins propios de la app (los de npm se registran solos): imprimir con el diálogo de Android
        registerPlugin(ImprimirPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
