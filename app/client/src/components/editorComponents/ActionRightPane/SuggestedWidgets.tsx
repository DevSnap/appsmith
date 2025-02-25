import { getTypographyByKey } from "constants/DefaultTheme";
import { WidgetTypes } from "constants/WidgetConstants";
import React, { memo } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { generateReactKey } from "utils/generators";
import { Collapsible } from ".";
import Tooltip from "components/ads/Tooltip";
import { addSuggestedWidget } from "actions/widgetActions";
import AnalyticsUtil from "utils/AnalyticsUtil";
import {
  ADD_NEW_WIDGET,
  createMessage,
  SUGGESTED_WIDGETS,
  SUGGESTED_WIDGET_TOOLTIP,
} from "constants/messages";
import { SuggestedWidget } from "api/ActionAPI";
import { useSelector } from "store";
import { getDataTree } from "selectors/dataTreeSelectors";
import { getWidgets } from "sagas/selectors";
import { getNextWidgetName } from "sagas/WidgetOperationSagas";

const WidgetList = styled.div`
  ${(props) => getTypographyByKey(props, "p1")}
  margin-left: ${(props) => props.theme.spaces[2] + 1}px;

  img {
    max-width: 100%;
  }

  .image-wrapper {
    position: relative;
    margin-top: ${(props) => props.theme.spaces[1]}px;
  }

  .widget:hover {
    cursor: pointer;
  }

  .widget:not(:first-child) {
    margin-top: 24px;
  }
`;

const WidgetOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - ${(props) => props.theme.spaces[1]}px);

  &:hover {
    display: block;
    background: rgba(0, 0, 0, 0.6);
  }
`;

type WidgetBindingInfo = {
  label: string;
  propertyName: string;
  widgetName: string;
  image?: string;
};

export const WIDGET_DATA_FIELD_MAP: Record<string, WidgetBindingInfo> = {
  [WidgetTypes.LIST_WIDGET]: {
    label: "items",
    propertyName: "listData",
    widgetName: "List",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/list.svg",
  },
  [WidgetTypes.TABLE_WIDGET]: {
    label: "tabledata",
    propertyName: "tableData",
    widgetName: "Table",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/table.svg",
  },
  [WidgetTypes.CHART_WIDGET]: {
    label: "chart-series-data-control",
    propertyName: "chartData",
    widgetName: "Chart",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/chart.svg",
  },
  [WidgetTypes.DROP_DOWN_WIDGET]: {
    label: "options",
    propertyName: "options",
    widgetName: "Select",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/dropdown.svg",
  },
  [WidgetTypes.TEXT_WIDGET]: {
    label: "text",
    propertyName: "text",
    widgetName: "Text",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/text.svg",
  },
  [WidgetTypes.INPUT_WIDGET]: {
    label: "text",
    propertyName: "defaultText",
    widgetName: "Input",
    image:
      "https://s3.us-east-2.amazonaws.com/assets.appsmith.com/widgetSuggestion/input.svg",
  },
};

function getWidgetProps(
  suggestedWidget: SuggestedWidget,
  widgetInfo: WidgetBindingInfo,
  actionName: string,
  widgetName?: string,
) {
  const fieldName = widgetInfo.propertyName;
  switch (suggestedWidget.type) {
    case WidgetTypes.TABLE_WIDGET:
      return {
        type: WidgetTypes.TABLE_WIDGET,
        props: {
          [fieldName]: `{{${actionName}.${suggestedWidget.bindingQuery}}}`,
          dynamicBindingPathList: [{ key: "tableData" }],
        },
        parentRowSpace: 10,
      };
    case WidgetTypes.CHART_WIDGET:
      const reactKey = generateReactKey();

      return {
        type: suggestedWidget.type,
        props: {
          [fieldName]: {
            [reactKey]: {
              seriesName: "Sales",
              data: `{{${actionName}.${suggestedWidget.bindingQuery}}}`,
            },
          },
          dynamicBindingPathList: [{ key: `chartData.${reactKey}.data` }],
        },
      };
    case WidgetTypes.DROP_DOWN_WIDGET:
      return {
        type: suggestedWidget.type,
        props: {
          [fieldName]: `{{${actionName}.${suggestedWidget.bindingQuery}}}`,
          defaultOptionValue: `{{${widgetName}.options[0].value}}`,
          dynamicBindingPathList: [
            { key: widgetInfo.propertyName },
            { key: "defaultOptionValue" },
          ],
        },
      };
    default:
      return {
        type: suggestedWidget.type,
        props: {
          [fieldName]: `{{${actionName}.${suggestedWidget.bindingQuery}}}`,
          dynamicBindingPathList: [{ key: widgetInfo.propertyName }],
        },
      };
  }
}

type SuggestedWidgetProps = {
  actionName: string;
  suggestedWidgets: SuggestedWidget[];
  hasWidgets: boolean;
};

function SuggestedWidgets(props: SuggestedWidgetProps) {
  const dispatch = useDispatch();
  const dataTree = useSelector(getDataTree);
  const canvasWidgets = useSelector(getWidgets);

  const addWidget = (
    suggestedWidget: SuggestedWidget,
    widgetInfo: WidgetBindingInfo,
  ) => {
    const widgetName = getNextWidgetName(
      canvasWidgets,
      suggestedWidget.type,
      dataTree,
    );
    const payload = getWidgetProps(
      suggestedWidget,
      widgetInfo,
      props.actionName,
      widgetName,
    );

    AnalyticsUtil.logEvent("SUGGESTED_WIDGET_CLICK", {
      widget: suggestedWidget.type,
    });

    dispatch(addSuggestedWidget(payload));
  };

  const label = props.hasWidgets
    ? createMessage(ADD_NEW_WIDGET)
    : createMessage(SUGGESTED_WIDGETS);

  return (
    <Collapsible label={label}>
      <WidgetList>
        {props.suggestedWidgets.map((suggestedWidget) => {
          const widgetInfo: WidgetBindingInfo | undefined =
            WIDGET_DATA_FIELD_MAP[suggestedWidget.type];

          if (!widgetInfo) return null;

          return (
            <div
              className={`widget t--suggested-widget-${suggestedWidget.type}`}
              key={suggestedWidget.type}
              onClick={() => addWidget(suggestedWidget, widgetInfo)}
            >
              <Tooltip content={createMessage(SUGGESTED_WIDGET_TOOLTIP)}>
                <div className="image-wrapper">
                  {widgetInfo.image && <img src={widgetInfo.image} />}
                  <WidgetOverlay />
                </div>
              </Tooltip>
            </div>
          );
        })}
      </WidgetList>
    </Collapsible>
  );
}

const MemoizedSuggestedWidgets = memo(SuggestedWidgets);
export default MemoizedSuggestedWidgets;
