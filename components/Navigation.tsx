import React from "react";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";

export type NavigationProps = {
    onAuthorize: () => void;
};

const Navigation: React.FunctionComponent<NavigationProps> = (p) => {
    return (
        <React.Fragment>
            <Navbar fixed="top"
                    className="mb-2"
                    bg="primary"
                    variant="dark">
                <Nav className="mr-auto">
                    <NavDropdown id="file-nav"
                                 title="File">
                        <NavDropdown.Item>New level</NavDropdown.Item>
                        <NavDropdown.Item>Open level</NavDropdown.Item>
                        <NavDropdown.Item>Close level</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={p.onAuthorize}>Authorize Access to Google Drive</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar>
        </React.Fragment>
    )
};

export default Navigation;
