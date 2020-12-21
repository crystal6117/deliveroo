import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, Alert, TouchableHighlight } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import DateTimePicker from '@react-native-community/datetimepicker';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { FrameButton, ButtonText } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { ceeboAlert } from '../../utils/alert';
import styles from './styles';
import { connect } from 'react-redux';
import { TimePicker } from "react-native-wheel-picker-android";

const RadioItem = (props) => (
    <TouchableOpacity
        style={{ paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', height: 58 }}
        onPress={() => props.onPress()}>
        <View style={{ width: 40 }}>
            {
                props.checked ? (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                        <EntypoIcon name="check" color="white" size={12} />
                    </View>
                ) : (
                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                    )
            }
        </View>
        <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#1A1824" }}>{props.name}</Text>
    </TouchableOpacity>
)

class DeliveryTimeScreen extends Component {
    constructor() {
        super();
        this.state = {
            asap: true,
            today: false,
            todayTime: this.adjustTime(new Date()),
            error: '',
            restaurantInfo: null,
            todayOpenHours: ''
        }

        this.weekNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        this.openHours = {}
    }

    componentDidMount() {
        const restaurantInfo = this.props.navigation.getParam("restaurantInfo");
        this.setState({ restaurantInfo });
        const now = new Date();
        const tHours = restaurantInfo?.opening_hours?.hours[this.weekNames[now.getDay()]]
        var tHourStr = '';
        if (tHours) {
            tHours.forEach((hour, i) => {
                tHourStr = tHourStr + (i > 0 ? "/" : "") + hour;
            })
            this.setState({ todayOpenHours: tHourStr });
        }

        if (restaurantInfo) {
            var openHoursWithStartEnd = {}
            this.weekNames.forEach(dialy => {
                const openhours = restaurantInfo.opening_hours.hours[dialy];
                var dialyHours = []
                if (openhours) {
                    openhours.forEach(item => {
                        if (item) {
                            const res = item.split('-');
                            dialyHours.push({
                                start: res[0],
                                end: res[1] === '00:00' ? '24:00' : res[1]
                            })
                        }
                    })
                }
                openHoursWithStartEnd[dialy] = dialyHours;
            });
            this.openHours = openHoursWithStartEnd;
        }

        const delivery = this.props.navigation.getParam("deliveryTime");
        if (delivery === "ASAP") {
            this.setState({ asap: true, today: false })
        } else {
            const arr = delivery.split(":");
            const hour = parseInt(arr[0]);
            const minute = parseInt(arr[1]);
            const now = new Date();
            now.setHours(hour);
            now.setMinutes(minute);
            this.setState({ asap: false, today: true, todayTime: now })
            this.onChangeTime({ type: 'set' }, now);
        }

    }

    onConfirm() {
        if (this.state.asap) {
            this.props.navigation.state.params.onDone('ASAP');
        } else {
            const res = this.getDeliveryStringFromDate(this.state.todayTime);
            if (this.checkValidation(this.state.todayTime) !== '') {
                ceeboAlert(translate("select-time-in-open-hours"));
                return;
            }
            this.props.navigation.state.params.onDone(res);
        }
        this.props.navigation.goBack();
    }

    getDeliveryStringFromDate(todayTime) {
        if (!todayTime) return "";

        var timeStr = "";
        const hour = todayTime.getHours();
        const minute = todayTime.getMinutes();
        if (hour < 10) timeStr += "0"
        timeStr += hour
        timeStr += ":"
        if (minute < 10) timeStr += "0"
        timeStr += minute
        return timeStr;
    }

    checkValidation(date) {
        if (date < new Date()) {
            return translate("past-time");
        }
        
        const weekNo = date.getDay();
        const timeStr = this.getDeliveryStringFromDate(date)
        const openHours = this.openHours[this.weekNames[weekNo]]

        var valid = false;
        openHours.forEach(openHour => {
            if (openHour.start <= timeStr && openHour.end >= timeStr) {
                valid = true;
            }
        })

        if (valid) return ''
        else return translate("invalid-time");
    }

    adjustTime(date) {
        const minute = date.getMinutes();
        const rest = minute % 15;
        if (rest !== 0) {
            if (rest >= 7) {
                date.setMinutes(minute + 15 - rest);
            } else {
                date.setMinutes(minute - rest);
            }
        }
        return date;
    }

    onChangeTime(event, date) {
        // evaluate validation of selected time

    }

    render() {
        return (
            <View style={styles.container}>
                <CeeboHeader1
                    left={{
                        type: 'icon',
                        name: 'arrow-left',
                        size: 25,
                        color: '#FF5D5D',
                        callback: () => this.props.navigation.goBack()
                    }}
                    offset={this.props.appInfo.statusbarHeight}
                >
                    <Text style={styles.title}>{translate("delivery-time")}</Text>
                </CeeboHeader1>
                <View style={styles.maincontainer}>
                    <View style={[styles.contentframe, { paddingBottom: 10 }]}>
                        <RadioItem checked={this.state.asap} name={translate("asap")} onPress={() => {
                            this.setState({ asap: true, today: false })
                        }} />
                        <Divider left={0} />

                        <RadioItem checked={this.state.today} name={translate("today-at") + ":"} onPress={() => {
                            this.setState({ asap: false, today: true })
                        }} />
                        <View style={{ flexDirection: 'row', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 15 }}>
                            {this.state.today ? (null) : (
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6, backgroundColor: 'white', zIndex: 99 }} />
                            )}
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10, paddingBottom: Platform.OS === 'android' ? 20 : 0 }}>
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 23, color: '#333333' }}>{translate("today")}</Text>
                            </View>
                            <View style={{ flex: 1, paddingLeft: 10 }}>
                                {
                                    Platform.OS === 'ios' ? (
                                        <DateTimePicker
                                            value={this.state.todayTime}
                                            mode={'time'}
                                            is24Hour={true}
                                            display="default"
                                            minuteInterval={15}
                                            onChange={
                                                (event, date) => {
                                                    this.setState({ todayTime: date })
                                                    const error = this.checkValidation(date);
                                                    this.setState({ error })
                                                }
                                            }
                                        />
                                    ) : (
                                            <TimePicker
                                                onTimeSelected={
                                                    (date) => {
                                                        this.setState({ todayTime: date })

                                                        // evaluate validation of selected time.
                                                        const error = this.checkValidation(date);
                                                        this.setState({ error })
                                                    }
                                                }
                                                selectedItemTextSize={20}
                                                itemTextSize={16}
                                                initDate={this.state.todayTime}
                                                format24={true}
                                                minutes={["00", "15", "30", "45"]}
                                            />
                                        )
                                }
                            </View>
                        </View>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#FF5D5D', textAlign: 'center', marginBottom: 10 }}>{this.state.error}</Text>
                        <Text style={{ paddingHorizontal: 15, fontFamily: 'Circular Std', fontSize: 16, color: '#1A1824' }}>{translate("today-hours")}: {this.state.todayOpenHours}</Text>
                    </View>

                    <View style={{ padding: 15 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: "#3C3C43" }}>{translate("delivery-time-desc")}</Text>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
                    <FrameButton
                        backgroundColor="#FF5D5D"
                        width='100%'
                        onPress={() => this.onConfirm()}
                    >
                        <ButtonText textColor="white">{translate("confirm")}</ButtonText>
                    </FrameButton>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(DeliveryTimeScreen)