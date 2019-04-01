width = window.innerWidth;
height = window.innerHeight;
card_size = 120
original_card_size = 100
card_padding = 5
label_height = card_size * 25/100
card_screen_percent = 80
numcards = Math.floor(((width-card_size)*card_screen_percent/100)/(card_size + card_padding))
top_bar_height = 100
var brush, hue_bar;

bar_width = 20
bar_padding = 10
datapoints_limit = numcards * Math.floor((height - top_bar_height) / (card_size + card_padding + label_height))
selected_hue_range = [0, 255]
selected_saturation_range = [0,1]
selected_lightness_range = [0,1]
let n_colors = (datapoints_limit/numcards)*(card_padding + card_size + label_height)

margin = {right: 50, left: 0}

svg = d3.select("body")
	.append('svg')
	.attr('width', width)
	.attr('height', height)

textdiv = document.createElement('div')
textdiv.innerHTML = 'The Pantone Color Matching System is largely a standardized color reproduction system. By standardizing the colors, different manufacturers in different locations can all refer to the Pantone system to make sure colors match without direct contact with one another. '
textdiv.innerHTML += '<br><br> This tool is meant to help you navigate the massive database of Pantone colors.'
textdiv.innerHTML += '<br><br> <b>Brush</b> over the <b>hsl bars</b> to obtain the first ' + datapoints_limit + ' Pantone colors in the range you select. By selecting ranges on multiple bars, you will obtain the colors in the intersection of the selections.'
textdiv.innerHTML += '<br><b>Brush</b> over the <b>Pantone cards</b> in order to visualize where the selected colors are on the hsl bars.'
textdiv.innerHTML += '<br><br> Adjust card size: (work in progress)'
textdiv.style.position = 'absolute'
textdiv.style.top = top_bar_height + 'px'
textdiv.style.right = margin.right + 'px'
textdiv.style.maxWidth = (width - margin.right - margin.left - numcards*(card_size + card_padding) - 3*(bar_width + bar_padding) - 40) + 'px'
textdiv.style.fontSize = 'small'
textdiv.style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
document.body.append(textdiv)

textdiv2 = document.createElement('div')
textdiv2.innerHTML += '<br><br>Made with <a href="https://d3js.org/">d3</a> by <a href="https://picorana.github.io/">picorana</a>.'
textdiv2.style.position = 'absolute'
textdiv2.style.bottom = 20 + 'px'
textdiv2.style.right = margin.right + 'px'
textdiv2.style.maxWidth = (width - margin.right - margin.left - numcards*(card_size + card_padding) - 3*(bar_width + bar_padding) - 40) + 'px'
textdiv2.style.fontSize = 'small'
textdiv2.style.fontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
document.body.append(textdiv2)

d3.json('set1.json').then((data) => {

	window.full_data = data['set1']
	window.data = data['set1'].slice(0, datapoints_limit)

	create_shadow()

	svg.append('text')
		.attr('x', (numcards * (card_size + card_padding))/2)
		.attr('y', top_bar_height/2)
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-weight', 'bold')
		.attr('font-size', 'xx-large')
		.text("PANTONE finder")

	sliderStep = d3
	    .sliderBottom()
	    .min(40)
	    .max(400)
	    .width(300)
	    .ticks(6)
	    .step(20)
	    .default(card_size)
	    .on('onchange', val => {
	    	card_size = val
	    	numcards = Math.floor(((width-card_size - (bar_padding + bar_width)*3 - 60)*card_screen_percent/100)/(card_size + card_padding))
	    	label_height = card_size * 25/100
	    	if (card_size < 100) label_height = 0
	    	datapoints_limit = numcards * Math.floor((height - top_bar_height) / (card_size + card_padding + label_height))
	    	draw_cards_constrained()
	      //d3.select('p#value-step').text(d3.format('.2%')(val));
	    });

	sliderg = svg.append('g')
		.attr('transform', 'translate('+textdiv.getBoundingClientRect().x+', '+(textdiv.getBoundingClientRect().y + textdiv.getBoundingClientRect().height + 20 )+')')

	sliderg.append('g')
		.call(sliderStep)

	cards_container = svg.append('g')
		.attr('transform', 'translate(' + 0 +','+ top_bar_height +')')
	draw_cards(window.data)

	document.addEventListener('mousemove', e => {
		let x = e.clientX
		let y = e.clientY

		cards_container.selectAll('.pantone-card').selectAll('.hextext').style('opacity', 0)
		cards_container.selectAll('.pantone-card').selectAll('.rgbtext').style('opacity', 0)

		c = cards_container.selectAll('.pantone-card').filter((d, i)=> {
			cardx = (i%numcards)*(card_size + card_padding) + card_size/2
			cardy = Math.floor(i/numcards)*(card_size + card_padding + cur_label_height) + (card_size + label_height)/2

			if (Math.abs(x - cardx) < card_size/2 && Math.abs(y - cardy - card_size/2 - label_height) < card_size/2) return true
			else return false
		})

		c.selectAll('.hextext').style('opacity', 0.8)
		c.selectAll('.rgbtext').style('opacity', 0.8)
	});

	color_array = Array.apply(null, {length: n_colors}).map(Number.call, Number)

	bars = svg.append('g')
		.attr('transform', 'translate('+ (bar_padding) +','+0+')')
		.style("filter", "url(#drop-shadow)")
	// hue bar!
	hue_bar = bars.append("g")
		.attr('transform', 'translate(' + (numcards * (card_size + card_padding)) +','+ top_bar_height +')')

	hue_text = hue_bar.append('text')
	.attr('y', -10 )
	.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
	.attr('font-size', 'small')
	.text(0)	

	hue_bar.selectAll('rect')
		.data(color_array)
		.enter()
		.append('rect')
		.attr('class', 'hue_rect')
		.attr('width', bar_width)
		.attr('height', 1)
		.attr('fill', (d, i) => set_hue_bar_color(i))
		.attr('y', (d, i) => i)

	brush_hue = d3.brushY()
		.extent([[0, 0], [bar_width, height]])
		.on("brush end", p => brushed(p, 'hue'))
		.on("brush start", brushstart)

	hue_bar.append("g")
    .attr("class", "brush")
    .call(brush_hue);

    // saturation bar
    saturation_bar = bars.append("g")	
		.attr('transform', 'translate(' + (numcards * (card_size + card_padding) + bar_width + bar_padding) +','+top_bar_height+')')

	saturation_text = saturation_bar.append('text')
	.attr('y', -10 )
	.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
	.attr('font-size', 'small')
	.text(0)

    saturation_bar.selectAll('rect')
		.data(color_array)
		.enter()
		.append('rect')
		.attr('class', 'saturation_rect')
		.attr('width', bar_width)
		.attr('height', 1)
		.attr('fill', (d, i) => set_saturation_bar_color(i))
		.attr('y', (d, i) => i)

	brush_saturation = d3.brushY()
		.extent([[0, 0], [bar_width, height]])
		.on("brush end", p => brushed(p, 'saturation'))
		.on("brush start", brushstart)

	saturation_bar.append("g")
    .attr("class", "brush")
    .call(brush_saturation);

	lightness_bar = bars.append("g")	
		.attr('transform', 'translate(' + (numcards * (card_size + card_padding) + (bar_width + bar_padding)*2) +','+top_bar_height+')')

	lightness_text = lightness_bar.append('text')
	.attr('y', -10 )
	.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
	.attr('font-size', 'small')
	.text(0)

    lightness_bar.selectAll('rect')
		.data(color_array)
		.enter()
		.append('rect')
		.attr('class', 'lightness_rect')
		.attr('width', bar_width)
		.attr('height', 1)
		.attr('fill', (d, i) => set_lightness_bar_color(i))
		.attr('y', (d, i) => i)

	brush_lightness = d3.brushY()
		.extent([[0, 0], [bar_width, height]])
		.on("brush end", p => brushed(p, 'lightness'))
		.on("brush start", brushstart)

	lightness_bar.append("g")
    .attr("class", "brush")
    .call(brush_lightness);
})

font_size = function(){
	if (card_size < 150) return 'x-small'
	else if (card_size >= 150 && card_size < 250) return 'small'
	else return 'medium'
}

brushed = function(p, type='none'){
	if (d3.event.selection == null) return
	y0 = d3.event.selection[0]
	y1 = d3.event.selection[1]

	if (type == 'hue'){
		hue_bar.selectAll('rect').filter(r => r < n_colors)
			.attr('fill', (d, i) => set_hue_bar_color(i, l=-0.2, s=-0.2))
		hue_bar.selectAll('rect').filter(r => y0 < y1? (r < y1 && r > y0):(r > y1 && r < y0))
			.attr('fill', (d, i) => set_hue_bar_color(d))	
		hue_text.text(Math.floor(y0* 255/n_colors))
	} else if (type == 'saturation'){
		saturation_bar.selectAll('rect').filter(r => r < n_colors)
			.attr('fill', (d, i) => set_saturation_bar_color(i, l=-0.2, h=-0.2))
		saturation_bar.selectAll('rect').filter(r => y0 < y1? (r < y1 && r > y0):(r > y1 && r < y0))
			.attr('fill', (d, i) => set_saturation_bar_color(d))	
		saturation_text.text(Math.floor(y0*100/n_colors)/100)
	} else if (type == 'lightness'){
		lightness_bar.selectAll('rect').filter(r => r < n_colors)
			.attr('fill', (d, i) => set_lightness_bar_color(i, h=-0.5, s=-0.2))
		lightness_bar.selectAll('rect').filter(r => y0 < y1? (r < y1 && r > y0):(r > y1 && r < y0))
			.attr('fill', (d, i) => set_lightness_bar_color(d))	

		lightness_text.text(Math.floor(y0*100/n_colors)/100)
	}
	
	// filter cards!
	if (type == 'hue'){
		selected_hue_range = [d3.hsl('#f00').h + y0 * 255/n_colors, d3.hsl('#f00').h + y1 * 255/n_colors]
	} else if (type == 'saturation'){
		selected_saturation_range = [d3.hsl('#f00').s - y1/n_colors, d3.hsl('#f00').s - y0/n_colors]
	} else if (type == 'lightness'){
		selected_lightness_range = [d3.hsl('#f00').l + y0/n_colors, d3.hsl('#f00').l + y1/n_colors]
	}

	draw_cards_constrained()
}

draw_cards_constrained = function(){
	colorset = window.full_data.filter(d => {
		let hue = d3.hsl(d.hex).h
		let saturation = d3.hsl(d.hex).s
		let lightness = d3.hsl(d.hex).l + 0.45
		if ((hue > selected_hue_range[0] && hue < selected_hue_range[1])
			&& (saturation > selected_saturation_range[0] && saturation < selected_saturation_range[1])
			&& (lightness > selected_lightness_range[0] && lightness < selected_lightness_range[1])) return true
		else return false
	}).slice(0, datapoints_limit)
	draw_cards(colorset)
}


brushstart = function(p){
	hue_bar.selectAll('rect').filter(r => r < n_colors)
		.attr('fill', (d, i) => set_hue_bar_color(i))
}

set_hue_bar_color = function(i, l=0, s=0){
	c = d3.hsl('#f00')
	c.h += i * 255/n_colors
	c.l += l
	c.s += s
	return c + ""
}

set_lightness_bar_color = function(i, h=0, s=0){
	c = d3.hsl('#000')
	c.l += (i * 255/n_colors) /255
	c.h += h
	c.s += s
	return c + ""
}

set_saturation_bar_color = function(i, l=0, h=0){
	c = d3.hsl('#f11')
	c.s -= (i * 255/n_colors) /255
	c.l += l
	c.h += h
	return c + ""
}

cardbrushed = function(){

	cards_container.selectAll('.pantone-card').select('.outerrect').attr('stroke', 'none')

	if (d3.event.selection == null) return
	x0 = d3.event.selection[0][0]
	y0 = d3.event.selection[0][1]
	x1 = d3.event.selection[1][0]
	y1 = d3.event.selection[1][1]
	
	selected_cards = cards_container.selectAll('.pantone-card').filter((d, i) => {
		cardx = (i%numcards)*(card_size + card_padding) + card_size/2
		cardy = Math.floor(i/numcards)*(card_size + card_padding + cur_label_height) + (card_size + label_height)/2
		return cardx > x0 && cardx < x1 && cardy > y0 && cardy < y1
	})

	hue_bar.selectAll('.hue_rect').attr('fill', (d, i) => {
		let a = selected_cards.filter(c => Math.abs((i)/n_colors  - d3.hsl(c.hex).h/255) < 0.01)
		if (a.size() > 0) return set_hue_bar_color(i)
		else return set_hue_bar_color(i, l=-0.2, s=-0.2)
	})

	saturation_bar.selectAll('.saturation_rect').attr('fill', (d, i) => {
		let a = selected_cards.filter(c => Math.abs((n_colors - i)/n_colors - d3.hsl(c.hex).s) < 0.01)
		if (a.size() > 0) return set_saturation_bar_color(i)
		else return set_saturation_bar_color(i, l=-0.2, h=-0.2)
	})

	lightness_bar.selectAll('.lightness_rect').attr('fill', (d, i) => {
		let a = selected_cards.filter(c => Math.abs((i)/n_colors - d3.hsl(c.hex).l) < 0.01)
		if (a.size() > 0) return set_lightness_bar_color(i)
		return set_lightness_bar_color(i*.7, h=-0.5, s=2)
	})

	selected_cards.select('.outerrect').attr('stroke', '#444').attr('stroke-width', 10)
}

draw_cards = function(data){

	cards_container.selectAll('.pantone-card')
		.remove()

	if (card_size >= 100) cur_label_height = label_height
	else cur_label_height = 0

	card_brush = d3.brush()
	.extent([[0, 0], [(numcards*(card_size + card_padding)), (datapoints_limit/numcards)*(card_padding + card_size + label_height)]])
	.on('brush end', cardbrushed)

	cards = cards_container.selectAll('.pantone-card')
	.data(data)
	.enter()
	.append('g')
	.attr('transform', (d, i) => 'translate(' + (card_padding + (i%numcards)*(card_size + card_padding)) + ',' + (Math.floor(i/numcards)*(card_size + card_padding + cur_label_height)) +')')
	.attr('class', 'pantone-card')
	.style("filter", "url(#drop-shadow)")

	cards.append('rect')
	.attr('class', 'outerrect')
	.attr('width', card_size)
	.attr('height', card_size + label_height)

	cards.append('rect')
	.attr('width', card_size)
	.attr('height', card_size)
	.attr('fill', (d) => d.hex)
	.attr("pointer-events", "all")

	cards_container.append("g")
    .attr("class", "brush")
    .call(card_brush);


	if (card_size >= 100){
		cards.append('rect')
		.attr('y', card_size)
		.attr('x', 1)
		.attr('width', card_size - 2)
		.attr('height', label_height)
		.attr('fill', 'white')
		.attr('stroke', '#aaa')
		.attr('stroke-width', '1px')

		cards.append('text')
		.attr('y', card_size + 5 + card_size*5/100)
		.attr('x', card_size*5/100)
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-weight', 'bold')
		.attr('font-size', font_size())
		.text((d, i) => ('PANTONE ' + d.code.replace(' TCX', '').replace(' TPX', '').replace(' TN', '').replace(' TPG', '')))

		cards.append('text')
		.attr('y', card_size + 10 + card_size*10/100)
		.attr('x', card_size*5/100)
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-size', font_size())
		.text((d, i) => (d.name))

		cards.append('text')
		.attr('x', card_size/2)
		.attr('y', card_size/2)
		.attr('class', 'hextext')
		.attr('text-anchor', 'middle')
		.style('color', (d, i) => {
			if (d3.hsl(d.hex).l < 0.5) {console.log(d3.hsl(d.hex).l < 0.5); return 'white'}
			else return 'black'
		})
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-size', font_size())
		.attr('font-weight', 'bold')
		.style('opacity', 0.01)
		.attr('id', (d) => d.code)
		.text((d) => d.hex)

		cards.append('text')
		.attr('x', card_size/2)
		.attr('y', card_size/2 + 20)
		.attr('class', 'rgbtext')
		.attr('text-anchor', 'middle')
		.attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
		.attr('font-size', font_size())
		.attr('font-weight', 'bold')
		.style('opacity', 0.01)
		.attr('id', (d) => d.code)
		.text((d) => d.rgb)
	}
}

create_shadow = function(){
	//Container for the gradients
	var defs = svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter")
	    .attr("id","drop-shadow");
	filter.append("feGaussianBlur")
	    .attr("stdDeviation","3.5")
	    .attr("result","coloredBlur");
	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
	    .attr("in","coloredBlur");
	feMerge.append("feMergeNode")
	    .attr("in","SourceGraphic");
}

