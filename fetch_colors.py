from urllib.request import urlopen
from bs4 import BeautifulSoup
import json

r_dict = {'set1' : []}

for i in range(1, 15):
	html = urlopen("https://www.numerosamente.it/pantone-list/fashion-and-interior-designers/" + str(i))
	soup = BeautifulSoup(html, 'lxml')

	print(i)

	for elem in soup.findAll('tr')[1:]:
		color = {}
		color['code'] = elem.findAll("td")[0].text
		color['rgb'] = elem.findAll("td")[1].text
		color['hex'] = elem.findAll("td")[2].text
		color['name'] = elem.findAll("td")[3].text
		color['category'] = elem.findAll("td")[4].text

		found_same_name = False
		for elem2 in r_dict['set1']:
			if color['name'] != '' and color['name'] == elem2['name']:
				found_same_name = True

		if not found_same_name:	
			r_dict['set1'].append(color)

for i in range(1, 11):
	html = urlopen("https://www.numerosamente.it/pantone-list/industrial-designers/" + str(i))
	soup = BeautifulSoup(html, 'lxml')

	print(i)

	for elem in soup.findAll('tr')[1:]:
		color = {}
		color['code'] = elem.findAll("td")[0].text
		color['rgb'] = elem.findAll("td")[1].text
		color['hex'] = elem.findAll("td")[2].text
		color['name'] = elem.findAll("td")[3].text
		color['category'] = elem.findAll("td")[4].text

		found_same_name = False
		for elem2 in r_dict['set1']:
			if color['name'] != '' and color['name'] == elem2['name']:
				found_same_name = True

		if not found_same_name:	
			r_dict['set1'].append(color)

for i in range(1, 33):
	html = urlopen("https://www.numerosamente.it/pantone-list/graphic-designers/" + str(i))
	soup = BeautifulSoup(html, 'lxml')

	print(i)

	for elem in soup.findAll('tr')[1:]:
		color = {}
		color['code'] = elem.findAll("td")[0].text
		color['rgb'] = elem.findAll("td")[1].text
		color['hex'] = elem.findAll("td")[2].text
		color['name'] = elem.findAll("td")[3].text
		color['category'] = elem.findAll("td")[4].text

		found_same_name = False
		for elem2 in r_dict['set1']:
			if color['name'] != '' and color['name'] == elem2['name']:
				found_same_name = True

		if not found_same_name:	
			r_dict['set1'].append(color)

#print(r_dict)
res = open("set1.json", "w")
json.dump(r_dict, res, indent=4)


#32 pagine in graphic design