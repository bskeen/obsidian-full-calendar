import * as React from "react";
import { SetStateAction, useState } from "react";

import {
	CalendarSource,
	LocalCalendarSource,
	ICalendarSource,
	GoogleCalendarSource,
} from "../types";

interface CalendarSettingsProps {
	options: string[];
	setting: Partial<CalendarSource>;
	defaultColor: string;
	onColorChange: (s: string) => void;
	onSourceChange: (s: string) => void;
	onTypeChange: (s: string) => void;
	deleteCalendar: () => void;
}

export const CalendarSettingRow = ({
	options,
	setting,
	defaultColor,
	onColorChange,
	onSourceChange,
	onTypeChange,
	deleteCalendar,
}: CalendarSettingsProps) => {
	const dirOptions = [...options];
	if (setting.type === "local" && setting.directory) {
		dirOptions.push(setting.directory);
	}
	dirOptions.sort();
	return (
		<div style={{ display: "flex", width: "100%", marginBottom: "0.5rem" }}>
			<button type="button" onClick={deleteCalendar}>
				✕
			</button>
			{setting.type === "local" && (
				<select
					value={setting.directory || ""}
					onChange={(e) => onSourceChange(e.target.value)}
				>
					<option value="" disabled hidden>
						Choose a directory
					</option>
					{dirOptions.map((o, idx) => (
						<option key={idx} value={o}>
							{o}
						</option>
					))}
				</select>
			)}
			{setting.type === "gcal" /* || setting.type === "ical"*/ && (
				<input
					type="text"
					placeholder="URL for calendar feed"
					value={setting.url}
					onChange={(e) => onSourceChange(e.target.value)}
				/>
			)}
			<select
				value={setting.type || ""}
				onChange={(e) => onTypeChange(e.target.value)}
			>
				<option value="" disabled hidden>
					Calendar source
				</option>
				<option value={"local"}>Local calendar</option>
				<option value={"gcal"}>Google Calendar (Readonly)</option>
				{/* <option value={"ical"}>iCal / ICS (Readonly)</option> */}
			</select>
			<span style={{ flexGrow: 1 }}></span>
			<input
				type="color"
				value={setting.color || defaultColor}
				onChange={(e) => onColorChange(e.target.value)}
			/>
		</div>
	);
};

interface FolderSettingProps {
	directories: string[];
	submit: (payload: CalendarSource[]) => void;
	initialSetting: CalendarSource[];
	defaultColor: string;
}
export const CalendarSettings = ({
	directories,
	initialSetting,
	defaultColor,
	submit,
}: FolderSettingProps) => {
	const [settings, setSettingState] =
		useState<Partial<CalendarSource>[]>(initialSetting);

	const setSettings = (state: SetStateAction<Partial<CalendarSource>[]>) => {
		setSettingState(state);
		setDirty(true);
	};

	const [dirty, setDirty] = useState(false);

	const usedDirectories = settings
		.map((s) => s.type === "local" && s.directory)
		.filter((s) => s);
	const options = directories.filter(
		(dir) => usedDirectories.indexOf(dir) === -1
	);

	return (
		<div style={{ width: "100%" }}>
			{settings.map((s, idx) => (
				<CalendarSettingRow
					key={idx}
					options={options}
					setting={s}
					onTypeChange={(newType) =>
						setSettings((state) => [
							...state.slice(0, idx),
							{
								...state[idx],
								type: newType as /*"ical" |*/ "local" | "gcal", // TODO: Try to DRY this out.
							},
							...state.slice(idx + 1),
						])
					}
					onSourceChange={(src) =>
						setSettings((state) => [
							...state.slice(0, idx),
							{
								...state[idx],
								...(state[idx].type === "local"
									? { directory: src }
									: { url: src }),
							},
							...state.slice(idx + 1),
						])
					}
					onColorChange={(color) =>
						setSettings((state) => [
							...state.slice(0, idx),
							{ ...state[idx], color },
							...state.slice(idx + 1),
						])
					}
					defaultColor={defaultColor}
					deleteCalendar={() =>
						setSettings((state) => [
							...state.slice(0, idx),
							...state.slice(idx + 1),
						])
					}
				/>
			))}
			<div style={{ display: "flex", paddingTop: "1em" }}>
				<button
					onClick={() => {
						submit(
							settings
								.filter(
									(elt) =>
										elt.color !== undefined &&
										elt.type !== undefined &&
										((elt.type === "local" &&
											elt.directory !== undefined) ||
											(elt.type === "gcal" &&
												elt.url !== undefined)) /*||
											(elt.type === "ical" &&
												elt.url !== undefined)*/
								)
								.map((elt) => elt as CalendarSource)
						);
						setDirty(false);
					}}
					style={{
						backgroundColor: dirty
							? "var(--interactive-accent)"
							: undefined,
						color: dirty ? "var(--text-on-accent)" : undefined,
					}}
				>
					{dirty ? "Save" : "Settings Saved"}
				</button>
				<span style={{ flexGrow: 1 }}></span>
				<button
					onClick={() => {
						setSettings((state) => [...state, { type: "local" }]);
					}}
				>
					Add Calendar
				</button>
			</div>
		</div>
	);
};