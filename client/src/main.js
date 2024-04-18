import Kit from "./Kit";
import Lang from './Lang';
import { G, GB, LoadSettings, SaveSettings, LoadJobs } from "./G";
import AppRoot from './AppRoot.vue';
import { BuildApp, MountApp } from "./App";

import CsvFile1 from './assets/language_support.csv?raw';
import CsvFile2 from './assets/language_strings.csv?raw';

/**
 * Main.
 */
function main()
{
	// Load i18n file
	Lang.Init(acsv.Table.Parse(CsvFile1), acsv.Table.Parse(CsvFile2));
	Lang.customValue = Lang.getLangFieldBy(navigator.language);

	readLocalAppData();
	onWindowResize();

	// 1.New vue app
	var myApp = BuildApp(AppRoot);
	// 2.Init vue global
	myApp.config.globalProperties.G = G;
	myApp.config.globalProperties.GB = GB;
	myApp.config.globalProperties.Kit = Kit;
	myApp.config.globalProperties.Lang = Lang;
	// 3.Mount vue app
	MountApp(myApp, '#my-app');

	// Listen to window events
	window.onbeforeunload = (e) => SaveSettings();
	window.addEventListener("resize", onWindowResize);
	document.addEventListener("gesturestart", (e) => e.preventDefault());
	document.oncontextmenu = (e) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target.className.indexOf("el-popper") != -1 || e.target.className.indexOf("el-image") != -1) { /* pass */ } else { e.preventDefault(); } };
}
/**
 * Read local app data.
 */
function readLocalAppData()
{
	G.url = new URL(window.location.href);
	G.uid = localStorage.getItem('uid') || Kit.genUID();
	Kit.fillInto(LoadSettings(), GB.settings, true);
	GB.settings.runTimes++;
	GB.jobs = LoadJobs();
	localStorage.setItem('uid', G.uid);
}
/**
 * [Event] window resize.
 */
function onWindowResize()
{
	var widthA = 0;
	var widthB = 5;
	var m = false;
	// min-width
	if (m = window.matchMedia('(min-width: 576px)').matches)
	{
		widthA = 1;
	}
	if (m = window.matchMedia('(min-width: 768px)').matches)
	{
		widthA = 2;
	}
	if (m = window.matchMedia('(min-width: 992px)').matches)
	{
		widthA = 3;
	}
	if (m = window.matchMedia('(min-width: 1200px)').matches)
	{
		widthA = 4;
	}
	// max-width
	if (m = window.matchMedia('(max-width: 1199.98px)').matches)
	{
		widthB = 4;
	}
	if (m = window.matchMedia('(max-width: 991.98px)').matches)
	{
		widthB = 3;
	}
	if (m = window.matchMedia('(max-width: 767.98px)').matches)
	{
		widthB = 2;
	}
	if (m = window.matchMedia('(max-width: 575.98px)').matches)
	{
		widthB = 1;
	}
	GB.isTabletView = widthA < 3;
	GB.isPhoneView = widthB < 2;
	GB.isTouchDevice = navigator.maxTouchPoints > 0;
}

main();