import React from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import CustomIcon from "../config/CustomIcons.js";

class Ico extends React.Component {
    static propTypes = {
        icoName: PropTypes.string.isRequired,
        icoColor: PropTypes.string.isRequired,
        icoSize: PropTypes.number.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            fontLoaded: false,
        }
    }

    componentWillMount () {
        this.setState({
            fontLoaded: true,
        });
    }

    render() {
        const {icoName, icoColor, icoSize} = this.props;

        return (
            <View accessible={false}>
            {
                this.state.fontLoaded ? <CustomIcon name={icoName} color={icoColor} size={icoSize} /> : <Text>Font Not Loaded</Text>
            }
            </View>
        );
    }
}

export default Ico;