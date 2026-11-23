package io.github.ajandradeperez.estudio;

import android.content.Context;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * «Imprimir» para la app nativa: window.print() no existe en el WebView de Android. Abre el diálogo de impresión del
 * sistema (que también permite «Guardar como PDF») con la página tal como se ve al imprimir (@media print y la clase
 * .imprimiendo de la app). La llamada termina cuando el usuario imprime o cancela (src/nucleo/plataforma.js → imprimir()).
 */
@CapacitorPlugin(name = "Imprimir")
public class ImprimirPlugin extends Plugin {
    @PluginMethod
    public void imprimir(PluginCall call) {
        String titulo = call.getString("titulo", "Estudio+");
        getActivity().runOnUiThread(() -> {
            try {
                WebView web = getBridge().getWebView();
                PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter base = web.createPrintDocumentAdapter(titulo);
                pm.print(titulo, new PrintDocumentAdapter() {
                    @Override public void onStart() { base.onStart(); }
                    @Override public void onLayout(PrintAttributes a, PrintAttributes b, CancellationSignal c, LayoutResultCallback r, Bundle e) { base.onLayout(a, b, c, r, e); }
                    @Override public void onWrite(PageRange[] p, ParcelFileDescriptor d, CancellationSignal c, WriteResultCallback r) { base.onWrite(p, d, c, r); }
                    @Override public void onFinish() { base.onFinish(); call.resolve(); }
                }, new PrintAttributes.Builder().build());
            } catch (Exception ex) {
                call.reject("No se pudo abrir la impresión: " + ex.getMessage());
            }
        });
    }
}
