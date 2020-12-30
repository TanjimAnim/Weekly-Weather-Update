import React from "react";
import { ChakraProvider, useAccordionItemState } from "@chakra-ui/react";
import {
  Heading,
  Text,
  Select,
  Box,
  Image,
  Stack,
  VStack,
  Spacer,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText
} from "@chakra-ui/react";
import divisions from "../data/divisions";
import dummyDailyData from "../data/dailyData";
import Skycons, { SkyconsType } from "react-skycons";

const dontCallApi = true;    //set the value to false to fetch the API.

const initialDivisionId = "3";

const skyiconMap = {
  Clear: SkyconsType.CLEAR_DAY,
  Clouds: SkyconsType.CLOUDY,
  Snow: SkyconsType.SNOW,
  Drizzle: SkyconsType.RAIN,
  Rain: SkyconsType.SLEET,
  Fog: SkyconsType.FOG
};


const fetchDailyWeather = (lat, long) => {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=metric&exclude=alerts&appid={API_KEY}`;

  if (dontCallApi) {
    return Promise.resolve(dummyDailyData);
  }

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.daily;
    });
};

const getDivision = (divisionId) => {
  return divisions.find((division) => division.id === divisionId);
};

function WeatherCard({ item, name }) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };



  return (
    <Stack
      spacing={4}
      bg="white"
      w="100%"
      p={5}
      color="black"
      maxW="2xl"
      borderWidth="1px"
      borderRadius="lg"
    >
      <Flex justifyContent="space-between">
        <Box>
          <Heading as="h3" size="lg">
            {name}
          </Heading>
          <Text>
            {new Date(item.dt * 1000).toLocaleDateString(undefined, options)}
          </Text>
        </Box>

        <Box>
          <Heading size="lg" alignItems="right">
            {item.temp.day} &#8451;
          </Heading>
          <Text size="sm" alignItems="right">
            Feels like: {item.feels_like.day}
          </Text>
        </Box>
      </Flex>

      <Box>
        <Flex>
          <Skycons
            color="black"
            type={skyiconMap[item.weather[0].main]}
            animate={true}
            size={60}
            resizeClear={true}
          />
          <Text pl="20px" pt="10px">
            {item.weather[0].main}
          </Text>
          <Spacer />
          <Box>
            <Text align="right">
              <Text as="span" fontWeight="bold">
                Humidity
              </Text>
              : {item.humidity}%
            </Text>
            <Text align="right">
              <Text as="span" fontWeight="bold">
                Wind Speed
              </Text>
              : {item.wind_speed} km/h
            </Text>
          </Box>
        </Flex>
      </Box>
      <Accordion allowToggle mt="15px">
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              View More Details
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex w="100%" justifyContent="space-between">
              <Box>
                <Text>
                  Sunrise:{new Date(item.sunrise * 1000).toLocaleTimeString()}
                </Text>
                <Text>
                  Sunset:{new Date(item.sunset * 1000).toLocaleTimeString()}
                </Text>
              </Box>

              <Box>
                <Text>Min temperature of the day:{item.temp.min} &#8451;</Text>
                <Text>Max temperature of the day:{item.temp.max} &#8451;</Text>
              </Box>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
}

class Weather extends React.Component {
  constructor(props) {
    super(props);
    const division = getDivision(initialDivisionId);
    this.state = {
      divisionId: initialDivisionId,
      name: division.name,
      lat: division.lat,
      long: division.long,
      dailyWeatherData: []
    };
    this.fetchWeatherData = this.fetchWeatherData.bind(this);
  }

  onDivisionChange = (event) => {
    const divisionId = event.target.value;
    const { name, lat, long } = getDivision(divisionId);

    this.setState({
      divisionId: event.target.value,
      name: name,
      lat: lat,
      long: long
    });
  };

  fetchWeatherData() {
    fetchDailyWeather(this.state.lat, this.state.long)
      .then((dailyData) => {
        this.setState({
          dailyWeatherData: dailyData
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error
        });
      });
  }

  componentDidMount() {
    this.fetchWeatherData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.divisionId !== prevState.divisionId) {
      this.fetchWeatherData();
    }
  }

  render() {
    return (
      <Box p={4}>
        <Stack spacing={4}>
          <Title />
          <Flex flexDir="row" justifyContent="space-between">
            <Box />

            <Box>
              <FormControl minWidth="200px" px={4}>
                <FormLabel>Select City</FormLabel>
                <Select
                  variant="filled"
                  w="200px"
                  value={this.state.divisionId}
                  onChange={this.onDivisionChange}
                >
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Flex>
          <VStack spacing={4}>
            {this.state.dailyWeatherData.map((item) => (
              <WeatherCard key={item.dt} item={item} name={this.state.name} />
            ))}
          </VStack>
        </Stack>
      </Box>
    );
  }
}

const Title = () => {
  return (
    <Box align="center">
      <Heading size="xl">Weather App</Heading>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider>
      <Weather />
    </ChakraProvider>
  );
}

export default App;
