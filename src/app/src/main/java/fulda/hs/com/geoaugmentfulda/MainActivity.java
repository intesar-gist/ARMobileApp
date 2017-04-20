package fulda.hs.com.geoaugmentfulda;

import android.app.Activity;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends Activity {

    public static final String WIKITUDE_KEY = "gTNjGJo5eZdypPFIDTqRtHSlZ5vAvxbETtkvGgCd/gQOPZU69m47c+8zDd3z9ArZYlr28oikRrzCiirtzRTvumDd6AqzHcB8ixHXKZIApg53xyBBV1X9jMrQclu9xlvdG9g2GLk8YrhJ8T5kqsFwEUWf57arRL1DcfQmmUJpa/BTYWx0ZWRfX8SUgm+5Kep8BjGfwEuO/P8/AislYPIGpi8W0O013kMy2T9dJpOmhPzChO1hwE4eAtMFotT+NZrRIv+zPyJ+MngUHDHM3NxNcSVzkKayrFLRhtWKFx52iiDQipGTMDkFq5uJHKw698hFhBvQork84xjvdZpIPdZSjLvoYEoxdDWhhR1Qc9ytGAckKt5cyqkUaiJRxh1YccB7b8f+rq4Z8s9131O/wDBws2clWyGbvekfY96QWYwor35GWfSmFKEtJ71l+gC/djfRoTG9ispiYbMuisDzpiH7AovH0b8rtrxtQHuhWgurtPKdWrVUJM7PVTnPvJtCUoDnix4DTbIjhwNzAa9+NK/4YseGNeuq5xpYElWa428niZLfIosNAWrksISboiqCsksBrNx0qZJKUigP7Sih1Fqqynd8c7aJo/F6j7x69eMqGhFYGdi2P3fW5IJ4cAIO2nmgtVCznIedkw0OpqPvwf4QqFiQ4O+A1s+Pk5/g6BYe5HJEAe/8tOvaQUc8qBq9Nfqg";
    private ArchitectView architectView;
    private LocationProvider locationProvider;
    protected ArchitectJavaScriptInterfaceListener mArchitectJavaScriptInterfaceListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        this.architectView = (ArchitectView)this.findViewById( R.id.architectView );
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setFeatures(ArchitectStartupConfiguration.Features.Geo);
        config.setLicenseKey(WIKITUDE_KEY);

        this.architectView.onCreate( config );

        locationProvider = new LocationProvider(this, new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null && MainActivity.this.architectView != null ) {
                    // check if location has altitude at certain accuracy level & call right architect method (the one with altitude information)
                    if ( location.hasAltitude() && location.hasAccuracy() && location.getAccuracy()<7) {
                        MainActivity.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.getAltitude(), location.getAccuracy() );
                    } else {
                        MainActivity.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.hasAccuracy() ? location.getAccuracy() : 1000 );
                    }
                }
            }

            @Override public void onStatusChanged(String s, int i, Bundle bundle) {}
            @Override public void onProviderEnabled(String s) {}
            @Override public void onProviderDisabled(String s) {}
        });

        // set JS interface listener, any calls made in JS like 'AR.platform.sendJSONObject({foo:"bar", bar:123})' is forwarded to this listener, use this to interact between JS and native Android activity/fragment
        this.mArchitectJavaScriptInterfaceListener = this.getArchitectJavaScriptInterfaceListener();

        // set JS interface listener in architectView, ensure this is set before content is loaded to not miss any event
        if (this.mArchitectJavaScriptInterfaceListener != null && this.architectView != null) {
            this.architectView.addArchitectJavaScriptInterfaceListener(mArchitectJavaScriptInterfaceListener);
        }

    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        try {
            this.architectView.onPostCreate();
        } catch (RuntimeException rex) {
            this.architectView = null;
            Toast.makeText(MainActivity.this, "can't create Architect View", Toast.LENGTH_SHORT).show();
            Log.e(this.getClass().getName(), "Exception in ArchitectView.onCreate()", rex);
        }

        try {
            this.architectView.load( "index.html" );
        } catch (Exception e) {
            Toast.makeText(MainActivity.this, "cannot load the AR scene view", Toast.LENGTH_SHORT).show();
            Log.e(this.getClass().getName(), "Exception in ArchitectView.load()", e);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        this.architectView.onResume();
        // start location updates
        locationProvider.onResume();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.architectView.onDestroy();
    }

    @Override
    protected void onPause() {
        super.onPause();

        this.architectView.onPause();
        // stop location updates
        locationProvider.onPause();
    }

    public ArchitectJavaScriptInterfaceListener getArchitectJavaScriptInterfaceListener() {
        return new ArchitectJavaScriptInterfaceListener() {

            @Override
            public void onJSONObjectReceived(JSONObject jsonObject) {
                try {
                    switch (jsonObject.getString("action")) {
                        case "pointer_detailed_activity":
                            final Intent poiDetailIntent = new Intent(MainActivity.this, PointerDetailsActivity.class);
                            poiDetailIntent.putExtra(PointerDetailsActivity.POINTER_ID, jsonObject.getString("id"));
                            poiDetailIntent.putExtra(PointerDetailsActivity.POINTER_TITLE, jsonObject.getString("title"));
                            poiDetailIntent.putExtra(PointerDetailsActivity.POINTER_DESCRIPTION, jsonObject.getString("description"));
                            MainActivity.this.startActivity(poiDetailIntent);
                            break;
                    }
                } catch (JSONException e) {
                    Log.e(this.getClass().getName(), "onJSONObjectReceived: ", e);
                }
            }

        };
    }
}
