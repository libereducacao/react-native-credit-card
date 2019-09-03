'use strict';

import React from 'react';
const { PropTypes, Component } = React;

import Payment from 'payment';
import FlipCard from 'react-native-flip-card';

import { View, TouchableOpacity, Text, StyleSheet, Platform, Image } from 'react-native';
const images = require('./images');
const validate = Payment.fns;

class CreditCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			type: {
				name: 'unknown',
				length: 16,
			},
		};
	}
	getValue(name) {
		return this[name]();
	}
	componentWillReceiveProps(nextProps) {
		this.updateType(nextProps);
	}
	componentWillMount() {
		this.updateType(this.props);
	}
	updateType(props) {
		if (!props.number) return this.setState({ type: { name: 'unknown', length: 16 } });

		var type = validate.cardType(props.number);
		if (type) {
			if (type === 'amex') {
				return this.setState({ type: { name: type, length: 15 } });
			} else {
				return this.setState({ type: { name: type, length: 16 } });
			}
		}

		return this.setState({ type: { name: 'unknown', length: 16 } });
	}
	number() {
		if (!this.props.number) {
			var string = '';
		} else {
			var string = this.props.number.toString();
		}

		const maxLength = this.state.type.length;

		const spacedNumber = [];

		if (string.length > maxLength) string = string.slice(0, maxLength);

		while (string.length < maxLength) {
			string += '•';
		}

		if (this.state.type.name === 'amex') {
			spacedNumber.push(
				<View>
					<Text style={styles.textNumber}>{string.slice(0, 4)}</Text>
				</View>
			);
			spacedNumber.push(
				<View>
					<Text style={styles.textNumber}>{string.slice(4, 10)}</Text>
				</View>
			);
			spacedNumber.push(
				<View>
					<Text style={styles.textNumber}>{string.slice(10, 15)}</Text>
				</View>
			);
		} else {
			const amountOfSpaces = Math.ceil(maxLength / 4);

			for (var i = 1; i <= amountOfSpaces; i++) {
				spacedNumber.push(
					<View>
						<Text style={styles.textNumber}>{string.slice((i - 1) * 4, i * 4)}</Text>
					</View>
				);
			}
		}

		return spacedNumber;
	}
	name() {
		if (!this.props.name) {
			return this.props.fullNameText.toUpperCase();
		} else {
			return this.props.name.toUpperCase();
		}
	}
	expiry() {
		if (this.props.expiry === '') {
			return '••/••••';
		} else {
			var expiry = this.props.expiry.toString();

			const expiryMaxLength = 6;

			if (expiry.match(/\//)) expiry = expiry.replace('/', '');

			if (!expiry.match(/^[0-9]*$/)) return '••/••••';

			while (expiry.length < 4) {
				expiry += '•';
			}

			expiry = expiry.slice(0, 2) + '/' + expiry.slice(2, expiryMaxLength);
		}

		return expiry;
	}

	cvv() {
		if (this.props.cvv == null) {
			return '•••';
		} else {
			return this.props.cvv.toString().length <= 4
				? this.props.cvv
				: this.props.cvv.toString().slice(0, 4);
		}
	}

	render() {
		const isAmex = this.state.type && this.state.type.name === 'amex';

		const { expiryAfterText, width } = this.props;
		const height = width / 1.65;

		const cardStyle = [
			styles.container,
			{
				width,
				height,
				backgroundColor: this.props.bgColor,
			},
			this.props.style,
		];

		const background =
			this.props.type || this.state.type.name !== 'unknown' ? this.props.background : 'blank';

		return (
			<View style={cardStyle}>
				<FlipCard
					style={[
						styles.container,
						{
							width,
							height,
							backgroundColor: this.props.bgColor,
						},
						this.props.style,
					]}
					friction={6}
					perspective={1000}
					flipHorizontal={true}
					flipVertical={false}
					flip={this.props.focused === 'cvv'}
					clickable={this.props.clickable}
					onFlipped={isFlipped => {
						console.log('isFlipped', isFlipped);
					}}
				>
					<View style={[styles.front, { width, height }]}>
						<Image
							source={{
								uri: images.backgroundFront[background],
							}}
							style={[styles.bgImage, { width, height }]}
						/>
						<View style={styles.lower}>
							{this.props.shiny ? <View style={styles.shinyFront} /> : null}
							<Image
								style={styles.logo}
								source={{
									uri:
										images.brands[
											this.props.type ? this.props.type : this.state.type.name
										],
								}}
							/>
							{isAmex ? (
								<View style={styles.cvvFront}>
									<Text style={styles.text}>{this.getValue('cvv')}</Text>
								</View>
							) : null}
							<View style={styles.info}>
								<View style={styles.number}>{this.getValue('number')}</View>
								<View style={styles.rowWrap}>
									<View style={styles.name}>
										<Text style={styles.textName}>{this.getValue('name')}</Text>
									</View>
									<View style={styles.expiry}>
										<Text style={styles.textValidThru}>{expiryAfterText}</Text>
										<Text style={styles.textExpiry}>
											{this.getValue('expiry')}
										</Text>
									</View>
								</View>
							</View>
						</View>
					</View>
					<View style={[styles.back, { width, height }]}>
						<Image
							source={{
								uri: images.backgroundBack[background],
							}}
							style={[styles.bgImage, { width, height }]}
						/>
						{this.props.bar ? <View style={styles.bar} /> : null}
						<View
							style={[
								styles.cvv,
								{
									right: width / 2.55,
									bottom: height / 2.55,
								},
							]}
						>
							<Text style={styles.textcvv}>{this.getValue('cvv')}</Text>
						</View>
						<Image
							style={styles.logoBack}
							source={{
								uri:
									images.brands[
										this.props.type ? this.props.type : this.state.type.name
									],
							}}
						/>
						{this.props.shiny ? (
							<View style={styles.shinyBack} data-after={this.props.shinyAfterBack} />
						) : null}
					</View>
				</FlipCard>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		borderWidth: 0,
		flex: null,
	},
	logo: {
		height: 35,
		width: 60,
		position: 'absolute',
		top: 17,
		left: 14,
	},
	logoBack: {
		height: 35,
		width: 56,
		position: 'absolute',
		bottom: 20,
		right: 20,
	},
	text: {
		color: '#fff',
	},
	bgImage: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		right: 0,
		borderRadius: 8,
	},
	lower: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-end',
		paddingVertical: 24,
		paddingHorizontal: 28,
	},
	number: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	expiry: {
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
	rowWrap: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	name: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	validthru: {
		justifyContent: 'center',
		backgroundColor: 'red',
	},
	textValidThru: {
		fontSize: 12,
		color: '#fff',
		fontFamily: 'avenirMedium',
		backgroundColor: 'transparent',
		textTransform: 'uppercase',
	},
	textSmall: {
		fontSize: 8,
		color: '#fff',
		fontWeight: '900',
		backgroundColor: 'transparent',
	},
	textNumber: {
		color: '#fff',
		fontSize: 18,
		fontFamily: 'avenirBold',
		marginBottom: 10,
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
	},
	textName: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'avenirBold',
		backgroundColor: 'transparent',
		textTransform: 'uppercase',
	},
	textExpiry: {
		color: '#fff',
		fontSize: 16,
		fontFamily: 'avenirBold',
		backgroundColor: 'transparent',
	},
	front: {
		flex: 1,
	},
	back: {
		flex: 1,
	},
	cvv: {
		width: 45,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
	},
	textcvv: {
		color: '#2a2a2a',
		fontSize: 18,
		fontFamily: 'avenirBold',
		textAlignVertical: 'center',
		textAlign: 'center',
	},
	info: {
		flex: 1,
	},
	shinyFront: {
		backgroundColor: '#ddd',
		borderRadius: 8,
		width: 50,
		height: 40,
		position: 'absolute',
		top: 15,
		left: 20,
	},
	shinyBack: {
		backgroundColor: '#ddd',
		borderRadius: 8,
		width: 50,
		height: 40,
		position: 'absolute',
		bottom: 15,
		left: 20,
	},
	bar: {
		height: 40,
		position: 'absolute',
		left: 0,
		right: 0,
		top: 30,
		backgroundColor: '#000',
	},
});

CreditCard.defaultProps = {
	number: null,
	cvv: null,
	name: '',
	expiry: '',
	focused: null,
	expiryBeforeText: 'mês/ano',
	expiryAfterText: 'validade',
	fullNameText: 'Nome Completo',
	shinyAfterBack: '',
	type: null,
	width: 305,
	bgColor: 'transparent',
	clickable: true,
	background: 'yellow',
};

CreditCard.CardImages = images;

module.exports = CreditCard;
