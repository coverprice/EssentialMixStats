import {Chart} from 'react-google-charts';
import React, { Component} from "react"
import {closeTooltipsOnClicks} from './lib'


export default class DJCounts extends Component {
	constructor(props) {
		super(props);
	}

	formatData(mixes){
		const mixesByArtists = mixes.reduce((acc, mix) => {
			if (!mix.duplicate){
				mix.artists.forEach((artist) => {
					acc[artist] = acc[artist] ? acc[artist] + 1 : 1
				})
			}
			return acc
		}, {})


		const buckets = Object.entries(mixesByArtists).reduce((acc, e) => {
			const [key, value] = e
			let bucketName
			let label
			if (value === 1){
				return acc
			}
			if (value <= 10) {
				bucketName = String(value)
				label = key
			}else {
				const bucket = Math.floor( (value - 1) / 10.0) * 10
				bucketName = `${bucket+1} - ${bucket+10}`
				label = `${key} - ${value}`
			}

			if (bucketName in acc){
				acc[bucketName].push(label)
			} else {
				acc[bucketName] = [label]
			}
			return acc
		}, [])


		return Object.entries(buckets).reduce((acc, e) => {
			const [bucket, djs] = e
			const tooltip = this.createToolTip(djs, bucket)
			acc.push([bucket, djs.length, tooltip])
			return acc
		}, []).sort((a, b) => Number(a[0].split(" ")[0]) - b[0].split(" ")[0])

	}

	createToolTip(djs, bucket){
		const link = "https://www.mixesdb.com/w/Special:Search?fulltext=Search&cat=Essential+Mix&search="

		const listItems = djs.reduce((acc, e) => {
			const searchTerm = e.replace(/- \d{1,2}$/, '')
			const item = `<li>
					<a target="_blank" href="${link+searchTerm}">${e}</a>
				</li>
			`
			return acc + item
		}, "")

		return (`<div class="dj-counts-tooltip chart-tooltip">
					<h4>${bucket} appearances</h4>
					<ul class="text-left">
						${listItems}
					</ul>
				</div>`
		)
	}

	render(){
		const mixes = this.formatData(this.props.mixes)

		return 	(
			<div className={"col-xs-12"}>
				<Chart
					height={700}
					className={"center-block"}
					chartType="ColumnChart"
					loader={<div>Loading Chart</div>}
					data={[
						[
							{id: 'Artist', label: 'Artist', type: 'string'},
							{id: 'count', label: 'Number of Essential Mix Appearances', type: 'number'},
							{type: 'string', role: 'tooltip', 'p': {'html': true}},
						],
						...mixes
					]}
					options={{
						title: 'Number of appearances',
						chartArea: {'width': '80%', 'height': '80%'},
						hAxis: {
							title: 'Number of Appearances',
						},
						vAxis: {
							title: 'Number of DJs',
						},
						tooltip: {isHtml: true, trigger: 'selection'},
						legend: 'none',
					}}
					chartEvents={[{
						eventName: "ready",
						callback: ({ chartWrapper, google }) => closeTooltipsOnClicks(chartWrapper, google)
					}]}
				/>
			</div>
		)
	}
}