package fulda.hs.com.geoaugmentfulda;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.TextView;

public class PointerDetailsActivity extends AppCompatActivity {

    public static final String POINTER_ID = "id";
    public static final String POINTER_TITLE = "title";
    public static final String POINTER_DESCRIPTION = "description";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pointer_details_final);

        ((TextView)findViewById(R.id.pointer_id)).setText(  getIntent().getExtras().getString(POINTER_ID) );
        ((TextView)findViewById(R.id.pointer_title)).setText( getIntent().getExtras().getString(POINTER_TITLE) );
        ((TextView)findViewById(R.id.pointer_description)).setText(  getIntent().getExtras().getString(POINTER_DESCRIPTION) );
    }

    @Override
    protected void onResume() {
        super.onResume();

    }
}
