package fulda.hs.com.geoaugmentfulda;

import android.location.Location;
import android.location.LocationListener;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    public static final String WIKITUDE_KEY = "gTNjGJo5eZdypPFIDTqRtHSlZ5vAvxbETtkvGgCd/gQOPZU69m47c+8zDd3z9ArZYlr28oikRrzCiirtzRTvumDd6AqzHcB8ixHXKZIApg53xyBBV1X9jMrQclu9xlvdG9g2GLk8YrhJ8T5kqsFwEUWf57arRL1DcfQmmUJpa/BTYWx0ZWRfX8SUgm+5Kep8BjGfwEuO/P8/AislYPIGpi8W0O013kMy2T9dJpOmhPzChO1hwE4eAtMFotT+NZrRIv+zPyJ+MngUHDHM3NxNcSVzkKayrFLRhtWKFx52iiDQipGTMDkFq5uJHKw698hFhBvQork84xjvdZpIPdZSjLvoYEoxdDWhhR1Qc9ytGAckKt5cyqkUaiJRxh1YccB7b8f+rq4Z8s9131O/wDBws2clWyGbvekfY96QWYwor35GWfSmFKEtJ71l+gC/djfRoTG9ispiYbMuisDzpiH7AovH0b8rtrxtQHuhWgurtPKdWrVUJM7PVTnPvJtCUoDnix4DTbIjhwNzAa9+NK/4YseGNeuq5xpYElWa428niZLfIosNAWrksISboiqCsksBrNx0qZJKUigP7Sih1Fqqynd8c7aJo/F6j7x69eMqGhFYGdi2P3fW5IJ4cAIO2nmgtVCznIedkw0OpqPvwf4QqFiQ4O+A1s+Pk5/g6BYe5HJEAe/8tOvaQUc8qBq9Nfqg";
    private ArchitectView architectView;
    private LocationProvider locationProvider;

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

    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        this.architectView.onPostCreate();
        try {
            this.architectView.load( "index.html" );
        } catch (IOException e) {
            e.printStackTrace();
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
}
