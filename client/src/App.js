import { createApp } from 'vue';
import * as IconPark from '@icon-park/vue-next';

import '@icon-park/vue-next/styles/index.css';
import 'element-plus/dist/index.css';
import './assets/my-el.scss';
import "./assets/my.scss";

export var MyApp = null;
export var MyAppRoot = null;
export function BuildApp(rootCompoent)
{
	MyApp = createApp(rootCompoent);
	return MyApp;
}
export function MountApp(ins, id)
{
	// import same icons
	ins.component('icon-info', IconPark.Info);
	ins.component('icon-close-one', IconPark.CloseOne);
	ins.component('icon-help', IconPark.Help);
	ins.component('icon-delete', IconPark.Delete);
	ins.component('icon-copy', IconPark.Copy);
	ins.component('icon-refresh', IconPark.Refresh);
	ins.component('icon-fill', IconPark.BackgroundColor);
	MyAppRoot = ins.mount(id);
}