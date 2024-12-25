import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    height: "100%",
    backgroundColor: "#FFFCF4",
  },
  leaderboardItemCrown: {
    fontSize: 45,
  },
  monthTitle: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
  },
  leaderboardContainer: {
    bottom: -10,
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    columnGap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  leaderboardEntry: {
    flex: 1,
    height: '100%',
    alignItems: "center",
    justifyContent: "flex-end",
    rowGap: 5,
    maxWidth: 70,
  },
  leaderboardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  leaderboardPoints: {
    fontSize: 20,
    fontWeight: "600",
  },
  leaderboardPointsBar: {
    padding: 25,
    borderRadius: 20,
  },
});
