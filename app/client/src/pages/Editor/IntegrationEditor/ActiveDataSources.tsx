import React, { useMemo } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { AppState } from "reducers";
import { Datasource } from "entities/Datasource";
import DatasourceCard from "./DatasourceCard";
import Text, { TextType } from "components/ads/Text";
import Button, { Category, Size } from "components/ads/Button";
import { thinScrollbar } from "constants/DefaultTheme";
import { keyBy } from "lodash";
import { createMessage, EMPTY_ACTIVE_DATA_SOURCES } from "constants/messages";

const QueryHomePage = styled.div`
  ${thinScrollbar};
  padding: 5px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - ${(props) => props.theme.integrationsPageUnusableHeight}
  );

  .sectionHeader {
    font-weight: ${(props) => props.theme.fontWeights[2]};
    font-size: ${(props) => props.theme.fontSizes[4]}px;
    margin-top: 10px;
  }
`;

const CreateButton = styled(Button)`
  display: inline;
  padding: 4px 8px;
`;

const EmptyActiveDatasource = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.integrationsPageUnusableHeight}
  );
  display: flex;
  align-items: center;
  justify-content: center;
`;

type ActiveDataSourcesProps = {
  dataSources: Datasource[];
  applicationId: string;
  pageId: string;
  location: {
    search: string;
  };
  history: {
    replace: (data: string) => void;
    push: (data: string) => void;
  };
  onCreateNew: () => void;
};

function ActiveDataSources(props: ActiveDataSourcesProps) {
  const { dataSources } = props;

  const plugins = useSelector((state: AppState) => {
    return state.entities.plugins.list;
  });
  const pluginGroups = useMemo(() => keyBy(plugins, "id"), [plugins]);

  if (dataSources.length === 0) {
    return (
      <EmptyActiveDatasource>
        <Text cypressSelector="t--empty-datasource-list" type={TextType.H3}>
          {createMessage(EMPTY_ACTIVE_DATA_SOURCES)}&nbsp;
          <CreateButton
            category={Category.primary}
            onClick={props.onCreateNew}
            size={Size.medium}
            tag="button"
            text="Create New"
          />
        </Text>
      </EmptyActiveDatasource>
    );
  }

  return (
    <QueryHomePage className="t--active-datasource-list">
      {dataSources.map((datasource, idx) => {
        return (
          <DatasourceCard
            datasource={datasource}
            key={`${datasource.id}_${idx}`}
            plugin={pluginGroups[datasource.pluginId]}
          />
        );
      })}
    </QueryHomePage>
  );
}

export default ActiveDataSources;
