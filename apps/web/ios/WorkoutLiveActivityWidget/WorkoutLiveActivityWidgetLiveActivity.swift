import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct WorkoutLiveActivityWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GenericAttributes.self) { context in
            WorkoutLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.values["programName"] ?? "Workout")
                        .font(.headline)
                        .lineLimit(1)
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.values["elapsed"] ?? "00:00")
                        .font(.headline.monospacedDigit())
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    WorkoutProgressSection(context: context)
                        .padding(.horizontal, 8)
                        .padding(.bottom, 4)
                }
            } compactLeading: {
                Image(systemName: "dumbbell.fill")
                    .foregroundStyle(.orange)
            } compactTrailing: {
                Text(context.state.values["elapsed"] ?? "00:00")
                    .font(.caption.monospacedDigit())
            } minimal: {
                Image(systemName: "dumbbell.fill")
                    .foregroundStyle(.orange)
            }
        }
    }
}

@available(iOS 16.2, *)
private struct WorkoutLockScreenView: View {
    let context: ActivityViewContext<GenericAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "dumbbell.fill")
                    .foregroundStyle(.orange)
                Text(context.state.values["programName"] ?? "Workout")
                    .font(.headline)
                    .lineLimit(1)
                Spacer(minLength: 8)
                Text(context.state.values["elapsed"] ?? "00:00")
                    .font(.title3.weight(.semibold).monospacedDigit())
            }

            WorkoutProgressSection(context: context)

            HStack(spacing: 20) {
                WorkoutStatPill(
                    label: "Exercises done",
                    value: context.state.values["exercisesDone"] ?? "0"
                )
                WorkoutStatPill(
                    label: "Exercises left",
                    value: context.state.values["exercisesLeft"] ?? "0"
                )
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }
}

@available(iOS 16.2, *)
private struct WorkoutProgressSection: View {
    let context: ActivityViewContext<GenericAttributes>

    private var setsDone: Int { Int(context.state.values["setsDone"] ?? "0") ?? 0 }
    private var setsTotal: Int { Int(context.state.values["setsTotal"] ?? "0") ?? 0 }
    private var progress: Double {
        if let raw = context.state.values["setsProgress"], let value = Double(raw) {
            return min(max(value, 0), 1)
        }
        guard setsTotal > 0 else { return 0 }
        return Double(setsDone) / Double(setsTotal)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Sets")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(setsDone)/\(setsTotal)")
                    .font(.caption.weight(.semibold).monospacedDigit())
                    .foregroundStyle(.secondary)
            }

            WorkoutDumbbellProgressBar(progress: progress, setsDone: setsDone)
        }
    }
}

@available(iOS 16.2, *)
private struct WorkoutDumbbellProgressBar: View {
    let progress: Double
    let setsDone: Int

    private let trackHeight: CGFloat = 10
    private let iconSize: CGFloat = 30
    private let progressOrange = Color(red: 1, green: 0.38, blue: 0)
    private let progressHighlight = Color(red: 1, green: 0.66, blue: 0.12)

    var body: some View {
        GeometryReader { geometry in
            let usableWidth = max(geometry.size.width - iconSize, 0)
            let iconOffset = usableWidth * progress

            ZStack(alignment: .leading) {
                Capsule()
                    .fill(progressOrange.opacity(0.24))
                    .frame(height: trackHeight)
                    .padding(.horizontal, iconSize / 2)

                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [progressHighlight, progressOrange],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(
                        width: max(iconOffset + iconSize / 2, setsDone > 0 ? iconSize / 2 : 0),
                        height: trackHeight
                    )
                    .padding(.leading, iconSize / 2)
                    .shadow(color: progressOrange.opacity(0.65), radius: 6, y: 0)

                ZStack {
                    Circle()
                        .fill(Color(uiColor: .systemBackground))
                        .shadow(color: progressOrange.opacity(0.55), radius: 6, y: 0)
                        .shadow(color: .black.opacity(0.12), radius: 2, y: 1)
                    Image(systemName: "dumbbell.fill")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(progressOrange)
                }
                .frame(width: iconSize, height: iconSize)
                .offset(x: iconOffset)
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(height: iconSize)
    }
}

@available(iOS 16.2, *)
private struct WorkoutStatPill: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.weight(.semibold).monospacedDigit())
        }
    }
}
