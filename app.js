			//initial variables
			var interestYear = 20;
			var stepYear = 1;
			var maxInterestYear = 5;
			var paymentCycle = 1;
			var monthlyRepayment = 0;
			var monthlyInterest = 0;
			var amortData = [];
			
			//start up method
			$(function(){
				$(".ul-buttons li").click(function(){
					$(".ul-buttons li").removeClass("selected");
					$(this).addClass("selected");
					paymentCycle = parseInt($(this).attr("data-value"));
					calculateInterest();
				});
				
				//Add on blur event
				$("#interest, #txtInterest").on("blur", function(){
					//Perform a check if interest value has been entered invalid value, if it is, set the default value
					if(isNaN($("#interest").val())) {
						$("#interest").val(1000000);
					}
					
					if(isNaN($("#txtInterest").val())) {
						$("#txtInterest").val(8.99);
					}
					calculateInterest();
				});
			});
			
			//create the noUiSlider
			var range = document.getElementById('yearRange');
			noUiSlider.create(range, {
				range: {
					'min': 1,
					'max': maxInterestYear
				},
				step: stepYear,
				start: [interestYear],
				margin: 300,
				connect: true,
				direction: 'ltr',
				orientation: 'horizontal',
				pips: {
					mode: 'steps',
					stepped: false,
					density: 2
				}
			});
			
			//Add the change event to redraw the graph and calculate 
			range.noUiSlider.on("change", function(value){
				interestYear = parseInt(value[0]);
					calculateInterest();
			});
			
			//Chart
			google.charts.load('current', {'packages':['corechart']});
			function drawChart() {
				//Hold the  data array
				var interestData = [];
				
				var dt = new Date();
				var yearCounter = 1;
				
			// 	//Add the graph header
				var headerData = ['Year', 'Interest', 'Interest & Principal', 'Balance'];
				interestData.push(headerData);
				
				for(var i = dt.getFullYear(); i < dt.getFullYear() + interestYear; i++){
					interestData.push([i.toString(), getAmortData("interest", 12 * yearCounter), monthlyRepayment * 12 * yearCounter, getAmortData("balance", 12 * yearCounter)]);
					yearCounter++;
				}
				
				var data = google.visualization.arrayToDataTable(interestData);

				var options = {
				  title: 'Chart',
				  // hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
				  // vAxis: {minValue: 0},
				  pointsVisible: true
				};

				// var chart = new google.visualization.AreaChart(document.getElementById('graph-chart'));
				// chart.draw(data, options);
			}
			
			//Get amortization data based on type and terms
			function getAmortData(dataType, terms){
				var dataValue = 0;
				switch(dataType){
					case "interest":
						for(var i = 0; i < terms; i++){
							dataValue += parseFloat(amortData[i].Interest);
						}
						break;
					case "balance":
						dataValue = parseFloat(amortData[terms-1].Balance);
						break;
				}
				return Math.round(dataValue);
			}
			
			//calculate function
			function calculateInterest(){
				$("#year-value").html(interestYear);
				var interestVal = parseFloat($("#interest").val());
				var interestRate = parseFloat($("#txtInterest").val()) / 1200;
				var totalTerms = 12 * interestYear;
	
				//Monthly
				var schedulePayment = Math.round(interestVal * interestRate / (1 - (Math.pow(1/(1 + interestRate), totalTerms))));
				monthlyRepayment = schedulePayment;
				var totalInterestPay = totalTerms * schedulePayment;
				amort(interestVal, parseFloat($("#txtInterest").val())/100, totalTerms);
				
				switch(paymentCycle){
					case 2:
						//Fortnightly
						//we multiple by 12 then divided by 52 then multiple by 2
						schedulePayment = Math.round(((schedulePayment * 12) / 52) * 2);
						break;
					case 3:
						//Weekly
						//we multiple by 12 then divided by 52 
						schedulePayment = Math.round((schedulePayment * 12) / 52);
						break;
				}
				
				$("#repayment-value").html(schedulePayment);
				$("#interest-total").html(getAmortData("interest", totalTerms));
				monthlyInterest = (totalInterestPay - interestVal) / totalTerms;
				google.charts.setOnLoadCallback(drawChart);
			}
			
	calculateInterest();
			
			//function to calculate the amortization data
			function amort(balance, interestRate, terms)
			{
				amortData = [];
				
				//Calculate the per month interest rate
				var monthlyRate = interestRate/12;
				
				//Calculate the payment
				var payment = balance * (monthlyRate/(1-Math.pow(1+monthlyRate, -terms)));
					
				for (var count = 0; count < terms; ++count)
				{ 
					var interest = balance * monthlyRate;
					var monthlyPrincipal = payment - interest;
					var amortInfo = {
						Balance: balance.toFixed(2),
						Interest: balance * monthlyRate,
						MonthlyPrincipal: monthlyPrincipal
					}
					amortData.push(amortInfo);
					balance = balance - monthlyPrincipal;		
				}
				
			}
