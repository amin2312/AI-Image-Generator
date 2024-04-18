/// <reference path="./d/ACsv.d.ts" />
/**
 * I18N Language.
 */
export default class Lang
{
	static _support: acsv.Table;
	static _strings: acsv.Table;
	static _customValue: string;
	static customLabel: string | null;
	static alignment: string;
	/**
	 * Init.
	 */
	static Init(support, strings): void
	{
		Lang._support = support;
		Lang._strings = strings;
		Lang._strings.createIndexAt(0); // for id field
		Lang._strings.createIndexAt(1); // for name field
	}
	/**
	 * Get system definition.
	 */
	static get systemValue(): string
	{
		return Lang.getLangFieldBy(navigator.language);
	}
	/**
	 * Get custom definition.
	 */
	static get customValue(): string
	{
		return Lang._customValue;
	}
	static set customValue(v: string)
	{
		var rowLang: string | null = null;
		var rowName: string | null = null;
		var rows = Lang._support.selectAll().toObjs();
		var row: {
			name: string, langField: string, iso_639_3166: string;
		};
		for (let i = 0, n = rows.length; i < n; i++)
		{
			row = rows[i];
			if (row.langField == v)
			{
				rowLang = v;
				rowName = row.name;
				break;
			}
		}
		if (rowLang == v)
		{
			Lang._customValue = v;
			Lang.customLabel = rowName;
		}
		else
		{
			Lang._customValue = Lang.systemValue;
		}
		if (v == 'ar')
		{
			Lang.alignment = 'right';
		}
		else
		{
			Lang.alignment = 'left';
		}
	}
	/**
	 * Get lang field by iso-639-3166.
	 */
	static getLangFieldBy(iso_639_3166: string): string
	{
		var rows = Lang._support.selectAll().toObjs();
		var row: {
			name: string, langField: string, iso_639_3166: string;
		};
		for (let i = 0, n = rows.length; i < n; i++)
		{
			row = rows[i];
			if (row.iso_639_3166.indexOf(iso_639_3166) != -1)
			{
				return row.langField;
			}
		}
		var iso639 = iso_639_3166.split("-")[0];
		for (let i = 0, n = rows.length; i < n; i++)
		{
			row = rows[i];
			if (row.iso_639_3166.indexOf(iso639) != -1)
			{
				return row.langField;
			}
		}
		return rows[0].langField;
	}
	/**
	 * Get the language label by id.
	 */
	static id(value: any, index: number = 0): string
	{
		var obj = Lang._strings.selectWhenE(1, value, index).toFirstObj();
		if (obj == null)
		{
			console.log('error language id:' + value);
			return null;
		}
		var string: string = obj[Lang.customValue];
		if (string == null || string == '' || string == '&')
		{
			string = obj['en'];
		}
		return string;
	}
	/**
	 * Get the language label by name.
	 */
	static n: any = new Proxy({}, {
		get: function (obj, prop)
		{
			return Lang.id(prop, 1);
		}
	});
}