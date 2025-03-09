/**
 * Home screen
 */

import { View, Text } from "react-native";
import { Button } from "@components/ui/button";

export default function Home() {
  return (
    <View>
      <Text>Home</Text>
      <Button variant="outline" size="icon">
        <Text>Hello</Text>
      </Button>
    </View>
  );
}