/* Config Sample
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
const path = require("node:path");
const { themeVariables } = require(path.resolve(process.cwd(), "config/themes.js"));

function applyThemeEventColors (event) {
	const themedEvent = { ...event };
	const title = themedEvent.title || "";
	const themedCustomEventColors = [
		{ keyword: /soccer/i, color: "var(--mm-accent-soccer)" },
		{ keyword: /birthday/i, color: "var(--mm-accent-birthday)" }
	];

	for (const customEvent of themedCustomEventColors) {
		if (customEvent.keyword.test(title)) {
			themedEvent.color = customEvent.color;
			break;
		}
	}

	return themedEvent;
}

let config = {
	address: "localhost",	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
									// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],	// Set [] to allow all IP addresses
									// or add a specific IPv4 of 192.168.1.5 :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
									// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false,			// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "",	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "",	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",   // this variable is provided as a consistent location
			   // it is currently only used by 3rd party modules. no MagicMirror code uses this value
			   // as we have no usage, we  have no constraints on what this field holds
			   // see https://en.wikipedia.org/wiki/Locale_(computer_software) for the possibilities

	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 12,
	units: "imperial",
	hideConfigSecrets: true,
	watchTargets: ["config/config.js", "config/custom.css", "config/themes.js"],

	modules: [
		{
			module: "alert",
		},
		{
			module: "MMM-Touch",
			position: "fullscreen_above",
			classes: "fixed-page",
			config: {
				useDisplay: false,
				gestureCommands: {
					default: {}
				}
			}
		},
		{
			module: "MMM-TouchPages"
		},
		{
			module: "MMM-pages",
			config: {
				animationTime: 600,
				homePage: 0,
				timings: {
					default: 0
				},
				modules: [
					["page-calendar"],
					["page-chores"]
				],
				fixed: ["fixed-page", "alert"]
			}
		},
		{
			module: "clock",
			position: "top_left",
			classes: "fixed-page",
			config: {
				showPeriod: true,
				displaySeconds: true,
				lat: Number("${SECRET_HOME_LAT}"),
				lon: Number("${SECRET_HOME_LON}"),
				dateFormat: "dddd, MMMM D"
			}
		},
		{
			module: "updatenotification",
			position: "top_left",
			classes: "fixed-page"
		},
		{
			module: "MMM-ThemeToggle",
			position: "fullscreen_above",
			classes: "fixed-page",
			config: {
				defaultTheme: "dark",
				storageKey: "magicmirror-theme",
				themes: {
					dark: {
						buttonIcon: "sun",
						buttonText: "Light",
						buttonLabel: "Switch to light mode",
						variables: themeVariables.dark
					},
					light: {
						buttonIcon: "moon",
						buttonText: "Dark",
						buttonLabel: "Switch to dark mode",
						variables: themeVariables.light
					}
				}
			}
		},
		{
			module: "calendar",
			position: "top_right",
			classes: "calendar-source fixed-page",
			config: {
				broadcastPastEvents: true,
				maximumEntries: 100,
				maximumNumberOfDays: 365,
				showLocation: true,
				excludedEvents: [
					'therapy',
				],
				customEvents: [
					{
						keyword: "soccer",
						symbol: "futbol",
					},
					{
						keyword: "softball",
						symbol: "futbol",
					},
					{
						keyword: "birthday",
						symbol: "birthday-cake",
					},
				],
				calendars: [
					{
						name: "holidays",
						fetchInterval: 7 * 24 * 60 * 60 * 1000,
						symbol: "calendar-check",
						color: "var(--mm-accent-holidays)",
						url: "https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics"
					},
					{
						name: "family",
						symbol: "calendar-heart",
						color: "var(--mm-accent-family)",
						url: "${SECRET_FAMILY_CALENDAR_URL}",
					},
				]
			}
		},
		{
			module: "MMM-CalendarExt3",
			position: "top_right",
			classes: "page-calendar",
			config: {
				mode: "month",
				instanceId: "mainCalendar",
				locale: "en-US",
				firstDayOfWeek: 0,
				showWeekNumber: false,
				fontSize: "22px",
				eventHeight: "20px",
				maxEventLines: 4,
				cellDateOptions: {
					day: "numeric"
				},
				eventTimeOptions: {
					hour: "numeric",
					minute: "2-digit"
				},
				headerWeekDayOptions: {
					weekday: "short"
				},
				headerTitleOptions: {
					month: "long",
					year: "numeric"
				},
				customHeader: true,
				showHeader: true,
				useWeather: true,
				displayLegend: false,
				eventTransformer: applyThemeEventColors,
				waitFetch: 2000,
				animationSpeed: 180,
				animateIn: "fadeIn",
				animateOut: "fadeOut"
			}
		},
		{
			module: "weather",
			position: "bottom_left",
			classes: "fixed-page",
			config: {
				weatherProvider: "openmeteo",
				type: "current",
				lat: "${SECRET_HOME_LAT}",
				lon: "${SECRET_HOME_LON}",
				showHumidity: true,
				showSun: true,
				showWindDirection: true,
				appendLocationNameToHeader: true,
			}
		},
		{
			module: "weather",
			position: "bottom_left",
			classes: "fixed-page",
			config: {
				weatherProvider: "openmeteo",
				type: "forecast",
				lat: "${SECRET_HOME_LAT}",
				lon: "${SECRET_HOME_LON}",
				maxEntries: 4,
				forecastDateFormat: "ddd",
				fade: false,
				tableClass: "small",
				appendLocationNameToHeader: false
			}
		},
		{
			module: "MMM-Chores",
			position: "top_right",
			classes: "page-chores",
			header: "Chores",
			config: {
				updateInterval: 60 * 1000,
				adminPort: 5003,
				showDays: 14,
				showPast: true,
				textMirrorSize: "medium",
				showRedeemedRewards: false,
				voiceAssistant: {
					enabled: false
				}
			}
		},
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
