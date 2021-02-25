import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import {
  Heading,
  Text,
  Select,
  Box,
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
  ColorModeScript,
  useColorMode,
  Button,
  useColorModeValue
} from "@chakra-ui/react";
import divisions from "../data/divisions";
import dummyDailyData from "../data/dailyData";
import Skycons, { SkyconsType } from "react-skycons";
import theme from "../data/theme";

const dontCallApi = true;

const skyiconMap = {
  Clear: SkyconsType.CLEAR_DAY,
  Clouds: SkyconsType.CLOUDY,
  Snow: SkyconsType.SNOW,
  Drizzle: SkyconsType.RAIN,
  Rain: SkyconsType.SLEET,
  Fog: SkyconsType.FOG
};

const fetchDailyWeather = (lat, long) => {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=metric&exclude=alerts&appid=API_KEY`;

  if (dontCallApi) {
    return Promise.resolve(dummyDailyData);
  }

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.daily;
    });
};

const fetchCity = (lat, long) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return "Error";
      } else {
        return data.address;
      }
    });
};

const getDivision = (divisionId) => {
  return divisions.find((division) => division.id === divisionId);
};

function WeatherCard({ item, title }) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  const bg = useColorModeValue("white", "#1A202C");
  const color = useColorModeValue("black", "white");

  return (
    <Stack
      spacing={4}
      bg={bg}
      w="100%"
      p={5}
      color={color}
      maxW="2xl"
      borderWidth="1px"
      borderRadius="lg"
    >
      <Flex justifyContent="space-between">
        <Box>
          <Heading as="h4" size="md">
            {title}
          </Heading>
          <Text>
            {new Date(item.dt * 1000).toLocaleDateString(undefined, options)}
          </Text>
        </Box>

        <Box>
          <Heading size="md" alignItems="right" transition="0.6">
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
            color={color}
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
                  <Text as="span" fontWeight="bold">
                    Sunrise:
                  </Text>
                  {new Date(item.sunrise * 1000).toLocaleTimeString()}
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Sunset:
                  </Text>
                  {new Date(item.sunset * 1000).toLocaleTimeString()}
                </Text>
              </Box>

              <Box>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Min Temp of the day:
                  </Text>
                  {item.temp.min} &#8451;
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold">
                    Max Temp of the day:
                  </Text>
                  {item.temp.max} &#8451;
                </Text>
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
    const initialDivisionId = "3";
    const division = getDivision(initialDivisionId);

    this.state = {
      divisionId: initialDivisionId,
      name: division.name,
      lat: division.lat,
      long: division.long,
      dailyWeatherData: []
    };
    this.fetchWeatherData = this.fetchWeatherData.bind(this);
    this.fetchCityData = this.fetchCityData.bind(this);
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
  fetchCityData() {
    fetchCity(this.state.lat, this.state.long)
      .then((city) => {
        this.setState({
          name: `${city.state}, ${city.country}`
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
    if (!navigator.geolocation) {
      this.fetchWeatherData();
      console.log("your browswer doesn't support geolocation");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
          this.fetchWeatherData();
          this.fetchCityData();
        },
        (error) => {
          this.fetchWeatherData();
          console.error("Error Code = " + error.code + " - " + error.message);
        }
      );
    }
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
            <Box pt={6}>
              <ToggleMode />
            </Box>
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
              <WeatherCard key={item.dt} item={item} title={this.state.name} />
            ))}
          </VStack>
        </Stack>
      </Box>
    );
  }
}
function ToggleMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <header>
      <Button onClick={toggleColorMode}>
        {colorMode === "light" ? "Dark" : "Light"} Mode
      </Button>
    </header>
  );
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
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Weather />
    </ChakraProvider>
  );
}

export default App;
